"""
FastAPI Medical Case Training API
"""

import os
import sys
import re

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from datetime import datetime, timedelta

from models import get_db, engine, Base, Case, User, Chat, Message, Completion
import crud
import schemas
from ai_schemas import (
    PatientSimulationRequest,
    PatientSimulationResponse,
    FeedbackGenerationRequest,
    FeedbackGenerationResponse,
    PatientCaseContext,
    FeedbackCaseContext,
    ConversationMessage,
    FeedbackConversationMessage,
)
from ai_service import generate_patient_response, generate_feedback

app = FastAPI(
    title="Medical Case Training API",
    description="API for medical student training with GP-level patient cases",
    version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def extract_symptoms_from_description(description: str) -> dict:
    text = description.lower()
    
    symptom_patterns = {
        "cardiovascular": ["chest pain", "palpitations", "shortness of breath", "radiating pain", "arm pain", "jaw pain", "sweating", "diaphoresis"],
        "neurological": ["headache", "weakness", "numbness", "confusion", "aphasia", "hemiparesis", "dizziness", "vision changes", "seizure"],
        "respiratory": ["cough", "wheezing", "dyspnea", "sputum", "hemoptysis", "breathing difficulty"],
        "gastrointestinal": ["nausea", "vomiting", "abdominal pain", "diarrhea", "constipation", "bloating"],
        "infectious": ["fever", "chills", "rash", "fatigue", "malaise", "night sweats"],
        "musculoskeletal": ["joint pain", "stiffness", "swelling", "muscle pain", "back pain"],
        "dermatological": ["rash", "itching", "skin lesion", "discoloration"],
        "general": ["fatigue", "weight loss", "appetite loss", "sleep disturbance"]
    }

    presenting = []
    exam_findings = []
    
    for symptoms in symptom_patterns.values():
        for symptom in symptoms:
            if symptom in text:
                presenting.append(symptom)

    exam_patterns = ["blood pressure", "heart rate", "pulse", "temperature", "respiratory rate", 
                     "oxygen saturation", "tenderness", "swelling", "bruising", "pallor", "cyanosis", "edema"]
    for finding in exam_patterns:
        if finding in text:
            exam_findings.append(finding)

    absent = []
    common_rule_outs = ["fever", "nausea", "vomiting", "headache", "rash", "cough"]
    for symptom in common_rule_outs:
        if symptom not in text and len(presenting) > 0:
            absent.append(symptom)
            if len(absent) >= 3:
                break

    return {
        "presenting": list(set(presenting)),
        "absent": list(set(absent)),
        "exam_findings": list(set(exam_findings))
    }


def infer_patient_demographics(description: str) -> dict:
    age_match = re.search(r'(\d+)[\s-]*(year|yr|y\.?o\.?)', description, re.IGNORECASE)
    age = f"{age_match.group(1)} years old" if age_match else None
    
    gender = None
    if re.search(r'\b(male|man|boy|gentleman|he|his)\b', description, re.IGNORECASE):
        gender = "male"
    elif re.search(r'\b(female|woman|girl|lady|she|her)\b', description, re.IGNORECASE):
        gender = "female"
    
    return {"age": age, "gender": gender}


def get_or_create_default_user(db: Session) -> User:
    user = db.query(User).filter(User.username == "medstudent").first()
    if not user:
        user = User(
            username="medstudent",
            name="Dr. Candidate",
            avatar_url="https://github.com/shadcn.png",
            specialty="General Medicine"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


def difficulty_to_string(diff: int) -> str:
    return {1: "Beginner", 2: "Intermediate", 3: "Advanced"}.get(diff, "Intermediate")


def get_specialty_from_description(description: str, diagnosis: str) -> str:
    text = (description + " " + diagnosis).lower()
    if any(term in text for term in ["chest", "heart", "cardiac", "coronary", "infarction"]):
        return "Cardiology"
    if any(term in text for term in ["brain", "stroke", "neuro", "weakness", "aphasia", "hemiparesis"]):
        return "Neurology"
    if any(term in text for term in ["child", "pediatric", "year-old", "fever", "rash", "measles"]):
        return "Pediatrics"
    if any(term in text for term in ["lung", "cough", "breath", "respiratory", "pneumonia"]):
        return "Pulmonology"
    if any(term in text for term in ["stomach", "abdominal", "gastro", "bowel", "digestive"]):
        return "Gastroenterology"
    return "General Medicine"


@app.get("/")
def root():
    return {"message": "Medical Case Training API", "version": "2.0.0", "docs": "/docs"}


@app.get("/api/health")
def health_check():
    return {"status": "healthy"}


@app.get("/api/stats", response_model=schemas.StatsResponse)
def get_stats(db: Session = Depends(get_db)):
    return crud.get_stats(db)


@app.get("/api/cases", response_model=list[schemas.FrontendCaseResponse])
def get_cases_for_frontend(difficulty: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Case)
    
    if difficulty:
        diff_map = {"beginner": 1, "intermediate": 2, "advanced": 3}
        diff_int = diff_map.get(difficulty.lower())
        if diff_int:
            query = query.filter(Case.difficulty == diff_int)
    
    cases = query.all()
    
    result = []
    for case in cases:
        result.append(schemas.FrontendCaseResponse(
            id=case.id,
            title=case.chief_complaint or case.diagnosis,
            description=case.description or "",
            specialty=get_specialty_from_description(case.description or "", case.diagnosis),
            difficulty=difficulty_to_string(case.difficulty or 2),
            expected_diagnosis=case.diagnosis,
            acceptable_diagnoses="",
            image_url=None,
            status="available"
        ))
    
    return result


@app.get("/api/cases/{case_id}", response_model=schemas.FrontendCaseResponse)
def get_case_for_frontend(case_id: int, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    return schemas.FrontendCaseResponse(
        id=case.id,
        title=case.chief_complaint or case.diagnosis,
        description=case.description or "",
        specialty=get_specialty_from_description(case.description or "", case.diagnosis),
        difficulty=difficulty_to_string(case.difficulty or 2),
        expected_diagnosis=case.diagnosis,
        acceptable_diagnoses="",
        image_url=None,
        status="available"
    )


@app.get("/api/cases/difficulty/{difficulty}")
def get_cases_by_difficulty(difficulty: str, db: Session = Depends(get_db)):
    diff_map = {"beginner": 1, "intermediate": 2, "advanced": 3}
    diff_int = diff_map.get(difficulty.lower(), 2)
    
    cases = db.query(Case).filter(Case.difficulty == diff_int).all()
    
    return [schemas.FrontendCaseResponse(
        id=case.id,
        title=case.chief_complaint or case.diagnosis,
        description=case.description or "",
        specialty=get_specialty_from_description(case.description or "", case.diagnosis),
        difficulty=difficulty_to_string(case.difficulty or 2),
        expected_diagnosis=case.diagnosis,
        acceptable_diagnoses="",
        image_url=None,
        status="available"
    ) for case in cases]


@app.post("/api/chats", response_model=schemas.ChatResponse)
async def create_chat(chat_input: schemas.ChatCreate, db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    
    case = db.query(Case).filter(Case.id == chat_input.case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    chat = Chat(user_id=user.id, case_id=chat_input.case_id)
    db.add(chat)
    db.commit()
    db.refresh(chat)
    
    initial_message = Message(
        chat_id=chat.id,
        sender="ai",
        content="Hello doctor. I'm feeling not quite right today..."
    )
    db.add(initial_message)
    db.commit()
    
    return chat


@app.get("/api/chats/{chat_id}", response_model=schemas.ChatDetailResponse)
def get_chat(chat_id: int, db: Session = Depends(get_db)):
    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    messages = db.query(Message).filter(Message.chat_id == chat_id).order_by(Message.created_at).all()
    
    return schemas.ChatDetailResponse(
        id=chat.id,
        user_id=chat.user_id,
        case_id=chat.case_id,
        created_at=chat.created_at,
        messages=[schemas.MessageResponse(
            id=m.id,
            chat_id=m.chat_id,
            sender=m.sender,
            content=m.content,
            created_at=m.created_at
        ) for m in messages]
    )


@app.post("/api/chats/{chat_id}/messages", response_model=schemas.MessageResponse)
async def create_message(chat_id: int, message_input: schemas.MessageCreate, db: Session = Depends(get_db)):
    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    case = db.query(Case).filter(Case.id == chat.case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    user_message = Message(
        chat_id=chat_id,
        sender=message_input.sender,
        content=message_input.content
    )
    db.add(user_message)
    db.commit()
    db.refresh(user_message)
    
    if message_input.sender == "user":
        messages = db.query(Message).filter(Message.chat_id == chat_id).order_by(Message.created_at).all()
        
        conversation_history = [
            ConversationMessage(
                role="user" if m.sender == "user" else "assistant",
                content=m.content
            ) for m in messages[:-1]
        ]
        
        extracted = extract_symptoms_from_description(case.description or "")
        demographics = infer_patient_demographics(case.description or "")
        
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
                conversation_history=conversation_history,
                student_message=message_input.content
            )
            
            ai_response = await generate_patient_response(request)
            ai_content = ai_response.patient_response
        except Exception as e:
            print(f"AI service error: {e}")
            ai_content = "I'm here, doctor. What would you like to know about how I'm feeling?"
        
        ai_message = Message(
            chat_id=chat_id,
            sender="ai",
            content=ai_content
        )
        db.add(ai_message)
        db.commit()
    
    return user_message


@app.delete("/api/chats/{chat_id}/messages/last")
def delete_last_user_message(chat_id: int, db: Session = Depends(get_db)):
    messages = db.query(Message).filter(
        Message.chat_id == chat_id,
        Message.sender == "user"
    ).order_by(Message.created_at.desc()).all()
    
    if messages:
        db.delete(messages[0])
        ai_messages = db.query(Message).filter(
            Message.chat_id == chat_id,
            Message.sender == "ai",
            Message.created_at > messages[0].created_at if len(messages) > 1 else True
        ).order_by(Message.created_at.desc()).first()
        if ai_messages:
            db.delete(ai_messages)
        db.commit()
    
    return {"success": True}


@app.post("/api/completions", response_model=schemas.CompletionResultResponse)
def create_completion(completion_input: schemas.CompletionCreate, db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    
    case = db.query(Case).filter(Case.id == completion_input.case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    diag_lower = completion_input.diagnosis.lower().strip()
    expected_lower = case.diagnosis.lower()
    
    result = "wrong"
    if diag_lower in expected_lower or expected_lower in diag_lower:
        result = "correct"
    elif any(word in expected_lower for word in diag_lower.split() if len(word) > 3):
        result = "partial"
    
    completion = Completion(
        user_id=user.id,
        case_id=completion_input.case_id,
        chat_id=completion_input.chat_id,
        diagnosis=completion_input.diagnosis,
        result=result
    )
    db.add(completion)
    db.commit()
    db.refresh(completion)
    
    return schemas.CompletionResultResponse(
        completion=schemas.CompletionResponse(
            id=completion.id,
            user_id=completion.user_id,
            case_id=completion.case_id,
            chat_id=completion.chat_id,
            diagnosis=completion.diagnosis,
            result=completion.result,
            created_at=completion.created_at
        ),
        result=result
    )


@app.delete("/api/completions/retry/{chat_id}")
def retry_completion(chat_id: int, db: Session = Depends(get_db)):
    completion = db.query(Completion).filter(
        Completion.chat_id == chat_id
    ).order_by(Completion.created_at.desc()).first()
    
    if completion:
        db.delete(completion)
        db.commit()
    
    return {"success": True}


@app.get("/api/user/stats", response_model=schemas.UserStatsResponse)
def get_user_stats(db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    
    completions = db.query(Completion).filter(
        Completion.user_id == user.id,
        Completion.result.in_(["correct", "partial"])
    ).all()
    
    completed_case_ids = list(set([c.case_id for c in completions]))
    cases_solved = len(completed_case_ids)
    
    if completions:
        scores = [100 if c.result == "correct" else 50 for c in completions]
        accuracy = sum(scores) / len(scores)
    else:
        accuracy = 0.0
    
    today = datetime.now().date()
    streak = 0
    check_date = today
    while True:
        day_completions = [c for c in completions if c.created_at and c.created_at.date() == check_date]
        if day_completions:
            streak += 1
            check_date -= timedelta(days=1)
        else:
            break
    
    return schemas.UserStatsResponse(
        streak=streak,
        cases_solved=cases_solved,
        accuracy=accuracy,
        completed_case_ids=completed_case_ids
    )


@app.get("/api/completions/completed")
def get_completed_case_ids(db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    
    completions = db.query(Completion).filter(
        Completion.user_id == user.id,
        Completion.result.in_(["correct", "partial"])
    ).all()
    
    return list(set([c.case_id for c in completions]))


@app.get("/api/feedback/{chat_id}")
async def get_feedback(chat_id: int, db: Session = Depends(get_db)):
    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    case = db.query(Case).filter(Case.id == chat.case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    messages = db.query(Message).filter(Message.chat_id == chat_id).order_by(Message.created_at).all()
    
    completion = db.query(Completion).filter(
        Completion.chat_id == chat_id
    ).order_by(Completion.created_at.desc()).first()
    
    if not completion:
        raise HTTPException(status_code=400, detail="Case not completed")
    
    extracted = extract_symptoms_from_description(case.description or "")
    
    try:
        request = FeedbackGenerationRequest(
            case=FeedbackCaseContext(
                case_id=f"case_{case.id}",
                title=case.chief_complaint or case.diagnosis,
                description=case.description or "",
                specialty=get_specialty_from_description(case.description or "", case.diagnosis),
                difficulty=difficulty_to_string(case.difficulty or 2),
                expected_diagnosis=case.diagnosis,
                acceptable_diagnoses="",
                presenting_symptoms=extracted["presenting"],
                absent_symptoms=extracted["absent"],
                exam_findings=extracted["exam_findings"]
            ),
            conversation=[FeedbackConversationMessage(
                sender=m.sender,
                content=m.content,
                timestamp=m.created_at
            ) for m in messages],
            student_diagnosis=completion.diagnosis,
            diagnosis_result=completion.result,
            time_spent_seconds=None
        )
        
        ai_feedback = await generate_feedback(request)
        
        return {
            "score": ai_feedback.score,
            "breakdown": {
                "correctDiagnosis": ai_feedback.breakdown.correct_diagnosis,
                "keyQuestions": ai_feedback.breakdown.key_questions,
                "rightTests": ai_feedback.breakdown.right_tests,
                "timeEfficiency": ai_feedback.breakdown.time_efficiency,
                "ruledOutDifferentials": ai_feedback.breakdown.ruled_out_differentials
            },
            "decisionTree": ai_feedback.decision_tree.model_dump() if hasattr(ai_feedback.decision_tree, 'model_dump') else ai_feedback.decision_tree,
            "clues": [c.model_dump() if hasattr(c, 'model_dump') else c for c in ai_feedback.clues],
            "insight": ai_feedback.insight.model_dump() if hasattr(ai_feedback.insight, 'model_dump') else ai_feedback.insight,
            "userDiagnosis": ai_feedback.user_diagnosis,
            "correctDiagnosis": ai_feedback.correct_diagnosis,
            "result": ai_feedback.result
        }
    except Exception as e:
        print(f"AI feedback generation failed: {e}")
        return generate_fallback_feedback(case, messages, completion)


def generate_fallback_feedback(case, messages, completion):
    user_messages = [m for m in messages if m.sender == "user"]
    message_count = len(user_messages)
    
    is_correct = completion.result == "correct"
    is_partial = completion.result == "partial"
    
    correct_diagnosis_points = 40 if is_correct else (20 if is_partial else 0)
    key_questions_points = min(message_count * 4, 20)
    right_tests_points = 20 if is_correct else (10 if is_partial else 5)
    time_efficiency_points = 10 if message_count <= 8 else (7 if message_count <= 12 else 3)
    ruled_out_points = 10 if is_correct else (5 if is_partial else 2)
    
    total_score = correct_diagnosis_points + key_questions_points + right_tests_points + time_efficiency_points + ruled_out_points
    
    return {
        "score": total_score,
        "breakdown": {
            "correctDiagnosis": correct_diagnosis_points,
            "keyQuestions": key_questions_points,
            "rightTests": right_tests_points,
            "timeEfficiency": time_efficiency_points,
            "ruledOutDifferentials": ruled_out_points
        },
        "decisionTree": {
            "id": "root",
            "label": case.chief_complaint or case.diagnosis,
            "correct": None,
            "children": [{
                "id": "diag",
                "label": case.diagnosis.upper(),
                "correct": is_correct or is_partial,
                "children": []
            }]
        },
        "clues": [
            {"id": "1", "text": "Chief complaint details", "importance": "critical", "asked": message_count >= 1},
            {"id": "2", "text": "Symptom timeline", "importance": "helpful", "asked": message_count >= 2},
            {"id": "3", "text": "Medical history", "importance": "minor", "asked": message_count >= 3}
        ],
        "insight": {
            "summary": f"{'Great job!' if is_correct else 'Good attempt.'} The diagnosis was {case.diagnosis}.",
            "strengths": ["Completed the case"] + ([f"Correctly identified {case.diagnosis}"] if is_correct else []),
            "improvements": [] if is_correct else [f"The correct diagnosis was {case.diagnosis}"],
            "tip": f"Review the key symptoms for {case.diagnosis}"
        },
        "userDiagnosis": completion.diagnosis,
        "correctDiagnosis": case.diagnosis,
        "result": completion.result
    }


if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    uvicorn.run(app, host="0.0.0.0", port=8000)
