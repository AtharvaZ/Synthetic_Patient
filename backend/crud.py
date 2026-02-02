"""
CRUD operations for medical case database
"""

from sqlalchemy.orm import Session
from sqlalchemy import func
from models import Case, Symptom, CaseSymptom, Precaution
from schemas import CaseCreate, CaseUpdate, SymptomCreate


def get_case(db: Session, case_id: int) -> Case | None:
    return db.query(Case).filter(Case.id == case_id).first()


def get_case_by_case_id(db: Session, case_id: str) -> Case | None:
    return db.query(Case).filter(Case.case_id == case_id).first()


def get_cases(db: Session, skip: int = 0, limit: int = 100, difficulty: int | None = None):
    query = db.query(Case)
    if difficulty:
        query = query.filter(Case.difficulty == difficulty)
    return query.offset(skip).limit(limit).all()


def get_all_cases(db: Session):
    return db.query(Case).all()


def create_case(db: Session, case: CaseCreate) -> Case:
    db_case = Case(**case.model_dump())
    db.add(db_case)
    db.commit()
    db.refresh(db_case)
    return db_case


def update_case(db: Session, case_id: int, case_update: CaseUpdate) -> Case | None:
    db_case = get_case(db, case_id)
    if not db_case:
        return None
    
    update_data = case_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_case, field, value)
    
    db.commit()
    db.refresh(db_case)
    return db_case


def delete_case(db: Session, case_id: int) -> bool:
    db_case = get_case(db, case_id)
    if not db_case:
        return False
    
    db.delete(db_case)
    db.commit()
    return True


def get_symptom(db: Session, symptom_id: int) -> Symptom | None:
    return db.query(Symptom).filter(Symptom.id == symptom_id).first()


def get_symptom_by_name(db: Session, name: str) -> Symptom | None:
    return db.query(Symptom).filter(Symptom.name == name.lower()).first()


def get_symptoms(db: Session, category: str | None = None, skip: int = 0, limit: int = 100):
    query = db.query(Symptom)
    if category:
        query = query.filter(Symptom.category == category)
    return query.offset(skip).limit(limit).all()


def get_all_symptoms(db: Session):
    return db.query(Symptom).all()


def create_symptom(db: Session, symptom: SymptomCreate) -> Symptom:
    db_symptom = Symptom(**symptom.model_dump())
    db.add(db_symptom)
    db.commit()
    db.refresh(db_symptom)
    return db_symptom


def get_or_create_symptom(db: Session, name: str, category: str = "other") -> Symptom:
    symptom = get_symptom_by_name(db, name)
    if symptom:
        return symptom
    
    db_symptom = Symptom(name=name.lower(), category=category)
    db.add(db_symptom)
    db.commit()
    db.refresh(db_symptom)
    return db_symptom


def delete_symptom(db: Session, symptom_id: int) -> bool:
    db_symptom = get_symptom(db, symptom_id)
    if not db_symptom:
        return False
    
    db.delete(db_symptom)
    db.commit()
    return True


def get_case_symptoms(db: Session, case_id: int, symptom_type: str | None = None):
    query = db.query(CaseSymptom).filter(CaseSymptom.case_id == case_id)
    if symptom_type:
        query = query.filter(CaseSymptom.symptom_type == symptom_type)
    return query.all()


def add_case_symptom(db: Session, case_id: int, symptom_id: int, symptom_type: str) -> CaseSymptom:
    db_case_symptom = CaseSymptom(
        case_id=case_id,
        symptom_id=symptom_id,
        symptom_type=symptom_type
    )
    db.add(db_case_symptom)
    db.commit()
    db.refresh(db_case_symptom)
    return db_case_symptom


def remove_case_symptom(db: Session, case_symptom_id: int) -> bool:
    db_case_symptom = db.query(CaseSymptom).filter(CaseSymptom.id == case_symptom_id).first()
    if not db_case_symptom:
        return False
    
    db.delete(db_case_symptom)
    db.commit()
    return True


def get_case_precautions(db: Session, case_id: int):
    return db.query(Precaution).filter(Precaution.case_id == case_id).all()


def add_precaution(db: Session, case_id: int, precaution_text: str) -> Precaution:
    db_precaution = Precaution(case_id=case_id, precaution=precaution_text)
    db.add(db_precaution)
    db.commit()
    db.refresh(db_precaution)
    return db_precaution


def remove_precaution(db: Session, precaution_id: int) -> bool:
    db_precaution = db.query(Precaution).filter(Precaution.id == precaution_id).first()
    if not db_precaution:
        return False
    
    db.delete(db_precaution)
    db.commit()
    return True


def get_case_detail(db: Session, case_id: int) -> dict | None:
    case = get_case(db, case_id)
    if not case:
        return None
    
    case_symptoms = get_case_symptoms(db, case_id)
    precautions = get_case_precautions(db, case_id)
    
    presenting = [cs.symptom.name for cs in case_symptoms if cs.symptom_type == 'presenting']
    absent = [cs.symptom.name for cs in case_symptoms if cs.symptom_type == 'absent']
    exam = [cs.symptom.name for cs in case_symptoms if cs.symptom_type == 'exam_finding']
    
    return {
        "id": case.id,
        "case_id": case.case_id,
        "age": case.age,
        "gender": case.gender,
        "chief_complaint": case.chief_complaint,
        "history": case.history,
        "duration": case.duration,
        "severity": case.severity,
        "triggers": case.triggers,
        "diagnosis": case.diagnosis,
        "description": case.description,
        "difficulty": case.difficulty,
        "source": case.source,
        "created_at": case.created_at,
        "presenting_symptoms": presenting,
        "absent_symptoms": absent,
        "exam_findings": exam,
        "precautions": [p.precaution for p in precautions]
    }


def get_all_cases_detail(db: Session, difficulty: int | None = None) -> list[dict]:
    cases = get_cases(db, limit=1000, difficulty=difficulty)
    return [get_case_detail(db, c.id) for c in cases]


def get_stats(db: Session) -> dict:
    total_cases = db.query(func.count(Case.id)).scalar() or 0
    total_symptoms = db.query(func.count(Symptom.id)).scalar() or 0
    
    easy = db.query(func.count(Case.id)).filter(Case.difficulty == 1).scalar() or 0
    medium = db.query(func.count(Case.id)).filter(Case.difficulty == 2).scalar() or 0
    hard = db.query(func.count(Case.id)).filter(Case.difficulty == 3).scalar() or 0
    
    presenting = db.query(func.count(CaseSymptom.id)).filter(CaseSymptom.symptom_type == 'presenting').scalar() or 0
    absent = db.query(func.count(CaseSymptom.id)).filter(CaseSymptom.symptom_type == 'absent').scalar() or 0
    exam = db.query(func.count(CaseSymptom.id)).filter(CaseSymptom.symptom_type == 'exam_finding').scalar() or 0
    
    return {
        "total_cases": total_cases,
        "total_symptoms": total_symptoms,
        "easy_count": easy,
        "medium_count": medium,
        "hard_count": hard,
        "presenting_count": presenting,
        "absent_count": absent,
        "exam_finding_count": exam
    }


def search_cases_by_symptom(db: Session, symptom_name: str):
    symptom = get_symptom_by_name(db, symptom_name)
    if not symptom:
        return []
    
    case_symptoms = db.query(CaseSymptom).filter(
        CaseSymptom.symptom_id == symptom.id,
        CaseSymptom.symptom_type == 'presenting'
    ).all()
    
    return [get_case_detail(db, cs.case_id) for cs in case_symptoms]


def search_cases_by_diagnosis(db: Session, diagnosis: str):
    cases = db.query(Case).filter(Case.diagnosis.ilike(f"%{diagnosis}%")).all()
    return [get_case_detail(db, c.id) for c in cases]
