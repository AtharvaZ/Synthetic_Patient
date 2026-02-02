"""
Seed script to populate the database with training cases from training_cases.json
Run this after setting up a new database to load all 62 cases.
"""

import os
import sys
import json

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from models import engine, Base, SessionLocal, Symptom, Case, CaseSymptom


def get_or_create_symptom(db: Session, name: str, category: str = "other") -> Symptom:
    symptom = db.query(Symptom).filter(Symptom.name == name).first()
    if not symptom:
        symptom = Symptom(name=name, category=category, severity_weight=3)
        db.add(symptom)
        db.commit()
        db.refresh(symptom)
    return symptom


def categorize_symptom(name: str) -> str:
    name_lower = name.lower()
    if any(w in name_lower for w in ['fever', 'fatigue', 'malaise', 'weight', 'appetite', 'sweat']):
        return 'general'
    if any(w in name_lower for w in ['pain', 'ache', 'sore', 'cramp', 'tender']):
        return 'pain'
    if any(w in name_lower for w in ['cough', 'breath', 'wheez', 'chest', 'lung', 'nasal', 'throat', 'sputum']):
        return 'respiratory'
    if any(w in name_lower for w in ['nausea', 'vomit', 'diarrhea', 'constip', 'abdom', 'bowel', 'stool']):
        return 'gastrointestinal'
    if any(w in name_lower for w in ['rash', 'itch', 'skin', 'blister', 'lesion', 'red']):
        return 'skin'
    if any(w in name_lower for w in ['head', 'dizz', 'numb', 'tingle', 'confus', 'memory', 'vision']):
        return 'neurological'
    if any(w in name_lower for w in ['joint', 'muscle', 'back', 'neck', 'stiff', 'swell']):
        return 'musculoskeletal'
    if any(w in name_lower for w in ['urin', 'bladder', 'kidney']):
        return 'urinary'
    if any(w in name_lower for w in ['heart', 'pulse', 'blood pressure', 'palpit']):
        return 'cardiovascular'
    return 'other'


def seed_database():
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        existing_cases = db.query(Case).count()
        if existing_cases > 0:
            print(f"Database already has {existing_cases} cases. Skipping seed.")
            print("To re-seed, delete existing cases first.")
            return
        
        with open(os.path.join(os.path.dirname(__file__), 'training_cases.json'), 'r') as f:
            data = json.load(f)
        
        cases_data = data.get('cases', [])
        print(f"Loading {len(cases_data)} cases...")
        
        for case_data in cases_data:
            case = Case(
                case_id=case_data['case_id'],
                age=str(case_data['patient']['age']),
                gender=case_data['patient']['gender'],
                chief_complaint=case_data['presentation']['chief_complaint'],
                history=case_data['presentation'].get('history', ''),
                duration=case_data['presentation'].get('duration', ''),
                severity=case_data['presentation'].get('severity', ''),
                triggers=case_data['presentation'].get('triggers', ''),
                diagnosis=case_data['diagnosis']['condition'],
                description=case_data['diagnosis'].get('description', ''),
                difficulty=case_data.get('difficulty', 2),
                source=case_data.get('source', 'Unknown')
            )
            db.add(case)
            db.commit()
            db.refresh(case)
            
            symptoms = case_data.get('symptoms', {})
            
            for symptom_name in symptoms.get('reported', []):
                symptom = get_or_create_symptom(db, symptom_name, categorize_symptom(symptom_name))
                case_symptom = CaseSymptom(case_id=case.id, symptom_id=symptom.id, symptom_type='presenting')
                db.add(case_symptom)
            
            for symptom_name in symptoms.get('negative', []):
                symptom = get_or_create_symptom(db, symptom_name, categorize_symptom(symptom_name))
                case_symptom = CaseSymptom(case_id=case.id, symptom_id=symptom.id, symptom_type='absent')
                db.add(case_symptom)
            
            for symptom_name in symptoms.get('exam_findings', []):
                symptom = get_or_create_symptom(db, symptom_name, categorize_symptom(symptom_name))
                case_symptom = CaseSymptom(case_id=case.id, symptom_id=symptom.id, symptom_type='exam_finding')
                db.add(case_symptom)
            
            db.commit()
            print(f"  Added: {case_data['case_id']}")
        
        total_cases = db.query(Case).count()
        total_symptoms = db.query(Symptom).count()
        print(f"\nSeeding complete!")
        print(f"  Cases: {total_cases}")
        print(f"  Symptoms: {total_symptoms}")
        
    finally:
        db.close()


if __name__ == '__main__':
    seed_database()
