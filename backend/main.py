"""
FastAPI Medical Case Training API - Stateless Version
Database only stores cases. Chats are session-based (frontend manages state).
"""

import os
import sys
import re

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List

from models import get_db, engine, Base, Case
import schemas
from ai_schemas import (
    PatientSimulationRequest,
    PatientCaseContext,
    ConversationMessage,
    FeedbackGenerationRequest,
    FeedbackCaseContext,
    FeedbackConversationMessage,
)
from ai_service import generate_patient_response, generate_feedback, compare_diagnoses

app = FastAPI(
    title="Medical Case Training API",
    description="API for medical student training with GP-level patient cases",
    version="3.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class MessageInput(BaseModel):
    role: str
    content: str

class PatientMessageRequest(BaseModel):
    case_id: int
    conversation: List[MessageInput]
    student_message: str

class DiagnosisRequest(BaseModel):
    case_id: int
    conversation: List[MessageInput]
    diagnosis: str


def extract_symptoms_from_description(description: str) -> dict:
    text = description.lower()
    symptom_patterns = {
        "cardiovascular": ["chest pain", "palpitations", "shortness of breath", "radiating pain", "arm pain", "jaw pain", "sweating"],
        "neurological": ["headache", "weakness", "numbness", "confusion", "aphasia", "hemiparesis", "dizziness", "vision changes"],
        "respiratory": ["cough", "wheezing", "dyspnea", "sputum", "hemoptysis", "breathing difficulty"],
        "gastrointestinal": ["nausea", "vomiting", "abdominal pain", "diarrhea", "constipation", "bloating"],
        "infectious": ["fever", "chills", "rash", "fatigue", "malaise", "night sweats"],
        "musculoskeletal": ["joint pain", "stiffness", "swelling", "muscle pain", "back pain"],
    }
    presenting = []
    for symptoms in symptom_patterns.values():
        for symptom in symptoms:
            if symptom in text:
                presenting.append(symptom)
    
    exam_patterns = ["blood pressure", "heart rate", "pulse", "temperature", "tenderness", "swelling"]
    exam_findings = [f for f in exam_patterns if f in text]
    
    absent = []
    rule_outs = ["fever", "nausea", "vomiting", "headache", "rash"]
    for symptom in rule_outs:
        if symptom not in text and presenting:
            absent.append(symptom)
            if len(absent) >= 3:
                break
    
    return {"presenting": list(set(presenting)), "absent": list(set(absent)), "exam_findings": list(set(exam_findings))}


def infer_demographics(description: str) -> dict:
    age_match = re.search(r'(\d+)[\s-]*(year|yr|y\.?o\.?)', description, re.IGNORECASE)
    age = f"{age_match.group(1)} years old" if age_match else None
    gender = None
    if re.search(r'\b(male|man|boy|he|his)\b', description, re.IGNORECASE):
        gender = "male"
    elif re.search(r'\b(female|woman|girl|she|her)\b', description, re.IGNORECASE):
        gender = "female"
    return {"age": age, "gender": gender}


def difficulty_to_string(d: int) -> str:
    return {1: "Beginner", 2: "Intermediate", 3: "Advanced"}.get(d, "Intermediate")


def get_specialty(desc: str, diag: str) -> str:
    text = (desc + " " + diag).lower()
    if any(t in text for t in ["chest", "heart", "cardiac", "coronary"]):
        return "Cardiology"
    if any(t in text for t in ["brain", "stroke", "neuro", "weakness", "aphasia"]):
        return "Neurology"
    if any(t in text for t in ["child", "pediatric", "fever", "rash", "measles"]):
        return "Pediatrics"
    if any(t in text for t in ["lung", "cough", "breath", "respiratory"]):
        return "Pulmonology"
    return "General Medicine"


@app.get("/")
def root():
    return {"message": "Medical Case Training API", "version": "3.0.0", "docs": "/docs"}


@app.get("/api/health")
def health():
    return {"status": "healthy"}


@app.get("/api/cases", response_model=list[schemas.FrontendCaseResponse])
def list_cases(db: Session = Depends(get_db)):
    cases = db.query(Case).all()
    return [schemas.FrontendCaseResponse(
        id=c.id,
        title=c.chief_complaint or c.diagnosis,
        description=c.description or "",
        specialty=get_specialty(c.description or "", c.diagnosis),
        difficulty=difficulty_to_string(c.difficulty or 2),
        expected_diagnosis=c.diagnosis,
        acceptable_diagnoses="",
        image_url=None,
        status="available"
    ) for c in cases]


@app.get("/api/cases/{case_id}", response_model=schemas.FrontendCaseResponse)
def get_case(case_id: int, db: Session = Depends(get_db)):
    c = db.query(Case).filter(Case.id == case_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Case not found")
    return schemas.FrontendCaseResponse(
        id=c.id,
        title=c.chief_complaint or c.diagnosis,
        description=c.description or "",
        specialty=get_specialty(c.description or "", c.diagnosis),
        difficulty=difficulty_to_string(c.difficulty or 2),
        expected_diagnosis=c.diagnosis,
        acceptable_diagnoses="",
        image_url=None,
        status="available"
    )


@app.get("/api/cases/difficulty/{difficulty}")
def cases_by_difficulty(difficulty: str, db: Session = Depends(get_db)):
    diff_map = {"beginner": 1, "intermediate": 2, "advanced": 3}
    diff_int = diff_map.get(difficulty.lower(), 2)
    cases = db.query(Case).filter(Case.difficulty == diff_int).all()
    return [schemas.FrontendCaseResponse(
        id=c.id,
        title=c.chief_complaint or c.diagnosis,
        description=c.description or "",
        specialty=get_specialty(c.description or "", c.diagnosis),
        difficulty=difficulty_to_string(c.difficulty or 2),
        expected_diagnosis=c.diagnosis,
        acceptable_diagnoses="",
        image_url=None,
        status="available"
    ) for c in cases]


@app.get("/api/cases/{case_id}/similar", response_model=list[schemas.FrontendCaseResponse])
def get_similar_cases(case_id: int, limit: int = 5, db: Session = Depends(get_db)):
    """Get similar cases based on shared symptoms (at least 2 overlapping) or same specialty"""
    from models import CaseSymptom, Symptom
    from sqlalchemy import func
    
    target_case = db.query(Case).filter(Case.id == case_id).first()
    if not target_case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    target_symptom_ids = db.query(CaseSymptom.symptom_id).filter(
        CaseSymptom.case_id == case_id,
        CaseSymptom.symptom_type == 'presenting'
    ).subquery()
    
    similar_cases = db.query(
        Case,
        func.count(CaseSymptom.symptom_id).label('shared_count')
    ).join(
        CaseSymptom, Case.id == CaseSymptom.case_id
    ).filter(
        Case.id != case_id,
        CaseSymptom.symptom_type == 'presenting',
        CaseSymptom.symptom_id.in_(target_symptom_ids)
    ).group_by(
        Case.id
    ).having(
        func.count(CaseSymptom.symptom_id) >= 2
    ).order_by(
        func.count(CaseSymptom.symptom_id).desc()
    ).limit(limit).all()
    
    if len(similar_cases) < limit:
        target_specialty = get_specialty(target_case.description or "", target_case.diagnosis)
        existing_ids = [c.id for c, _ in similar_cases]
        specialty_cases = db.query(Case).filter(
            Case.id != case_id,
            Case.id.notin_(existing_ids) if existing_ids else True
        ).all()
        specialty_matches = [
            (c, 0) for c in specialty_cases 
            if get_specialty(c.description or "", c.diagnosis) == target_specialty
        ][:limit - len(similar_cases)]
        similar_cases.extend(specialty_matches)
    
    if not similar_cases:
        fallback_cases = db.query(Case).filter(Case.id != case_id).limit(limit).all()
        similar_cases = [(c, 0) for c in fallback_cases]
    
    return [schemas.FrontendCaseResponse(
        id=c.id,
        title=c.chief_complaint or c.diagnosis,
        description=c.description or "",
        specialty=get_specialty(c.description or "", c.diagnosis),
        difficulty=difficulty_to_string(c.difficulty or 2),
        expected_diagnosis=c.diagnosis,
        acceptable_diagnoses="",
        image_url=None,
        status="available"
    ) for c, _ in similar_cases[:limit]]


@app.post("/api/patient-message")
async def patient_message(data: PatientMessageRequest, db: Session = Depends(get_db)):
    """Stateless patient simulation - receives full conversation history"""
    case = db.query(Case).filter(Case.id == data.case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    history = [ConversationMessage(role=m.role, content=m.content) for m in data.conversation]
    extracted = extract_symptoms_from_description(case.description or "")
    demographics = infer_demographics(case.description or "")
    
    try:
        request = PatientSimulationRequest(
            case=PatientCaseContext(
                case_id=f"case_{case.id}",
                age=demographics["age"],
                gender=demographics["gender"],
                chief_complaint=case.chief_complaint,
                history=case.history,
                duration=case.duration,
                severity=case.severity,
                triggers=case.triggers,
                diagnosis=case.diagnosis,
                description=case.description,
                presenting_symptoms=extracted["presenting"],
                absent_symptoms=extracted["absent"],
                exam_findings=extracted["exam_findings"]
            ),
            conversation_history=history,
            student_message=data.student_message
        )
        response = await generate_patient_response(request)
        return {"response": response.patient_response}
    except Exception as e:
        print(f"AI error: {e}")
        return {"response": "I'm here, doctor. What would you like to know about how I'm feeling?"}


@app.post("/api/submit-diagnosis")
async def submit_diagnosis(data: DiagnosisRequest, db: Session = Depends(get_db)):
    """Submit diagnosis and get feedback - stateless, receives full conversation"""
    case = db.query(Case).filter(Case.id == data.case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    result = compare_diagnoses(data.diagnosis, case.diagnosis)
    extracted = extract_symptoms_from_description(case.description or "")
    
    try:
        request = FeedbackGenerationRequest(
            case=FeedbackCaseContext(
                case_id=f"case_{case.id}",
                title=case.chief_complaint or case.diagnosis,
                description=case.description or "",
                specialty=get_specialty(case.description or "", case.diagnosis),
                difficulty=difficulty_to_string(case.difficulty or 2),
                expected_diagnosis=case.diagnosis,
                acceptable_diagnoses="",
                presenting_symptoms=extracted["presenting"],
                absent_symptoms=extracted["absent"],
                exam_findings=extracted["exam_findings"]
            ),
            conversation=[FeedbackConversationMessage(sender=m.role, content=m.content, timestamp=None) for m in data.conversation],
            student_diagnosis=data.diagnosis,
            diagnosis_result=result,
            time_spent_seconds=None
        )
        fb = await generate_feedback(request)
        return {
            "result": result,
            "correctDiagnosis": case.diagnosis,
            "feedback": {
                "score": fb.score,
                "breakdown": {
                    "correctDiagnosis": fb.breakdown.correct_diagnosis,
                    "keyQuestions": fb.breakdown.key_questions,
                    "rightTests": fb.breakdown.right_tests,
                    "timeEfficiency": fb.breakdown.time_efficiency,
                    "ruledOutDifferentials": fb.breakdown.ruled_out_differentials
                },
                "decisionTree": fb.decision_tree.model_dump() if hasattr(fb.decision_tree, 'model_dump') else fb.decision_tree,
                "clues": [c.model_dump() if hasattr(c, 'model_dump') else c for c in fb.clues],
                "insight": fb.insight.model_dump() if hasattr(fb.insight, 'model_dump') else fb.insight,
            }
        }
    except Exception as e:
        print(f"AI feedback error: {e}")
        return generate_fallback_response(case, data.conversation, data.diagnosis, result)


def generate_fallback_response(case, conversation, user_diagnosis, result):
    n = len([m for m in conversation if m.role == "user"])
    is_correct = result == "correct"
    is_partial = result == "partial"
    
    diag_pts = 40 if is_correct else (20 if is_partial else 0)
    q_pts = min(n * 4, 20)
    test_pts = 20 if is_correct else (10 if is_partial else 5)
    time_pts = 10 if n <= 8 else (7 if n <= 12 else 3)
    diff_pts = 10 if is_correct else (5 if is_partial else 2)
    
    if is_correct:
        strengths = [
            f"Correctly diagnosed {case.diagnosis}",
            "Efficiently completed the case",
            "Demonstrated good clinical reasoning"
        ]
        improvements = [
            "Consider asking more detailed questions about symptom onset and duration",
            "Try exploring associated symptoms to strengthen differential diagnosis"
        ]
    elif is_partial:
        strengths = [
            "Made progress toward the correct diagnosis",
            "Asked relevant questions about the presenting complaint"
        ]
        improvements = [
            f"The diagnosis was close but {case.diagnosis} was the correct answer",
            "Consider asking about specific symptom characteristics",
            "Try to narrow down the differential diagnosis earlier"
        ]
    else:
        strengths = [
            "Engaged with the patient case",
            "Attempted to make a diagnosis"
        ]
        improvements = [
            f"The correct diagnosis was {case.diagnosis}",
            "Ask about chief complaint details including onset and severity",
            "Consider exploring associated symptoms systematically"
        ]
    
    return {
        "result": result,
        "correctDiagnosis": case.diagnosis,
        "feedback": {
            "score": diag_pts + q_pts + test_pts + time_pts + diff_pts,
            "breakdown": {"correctDiagnosis": diag_pts, "keyQuestions": q_pts, "rightTests": test_pts, "timeEfficiency": time_pts, "ruledOutDifferentials": diff_pts},
            "decisionTree": {"id": "root", "label": case.chief_complaint or case.diagnosis, "correct": None, "children": [{"id": "diag", "label": case.diagnosis.upper(), "correct": is_correct or is_partial, "children": []}]},
            "clues": [
                {"id": "1", "text": "Chief complaint details", "importance": "critical", "asked": n >= 1},
                {"id": "2", "text": "Symptom timeline", "importance": "helpful", "asked": n >= 2},
                {"id": "3", "text": "Medical history", "importance": "minor", "asked": n >= 3}
            ],
            "insight": {
                "summary": f"{'Great job!' if is_correct else ('Good effort.' if is_partial else 'Keep practicing.')} The diagnosis was {case.diagnosis}.",
                "strengths": strengths,
                "improvements": improvements,
                "tip": f"For {case.diagnosis}, focus on asking about the key presenting symptoms and their characteristics."
            }
        }
    }


if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    uvicorn.run(app, host="0.0.0.0", port=8000)
