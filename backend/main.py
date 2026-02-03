"""
FastAPI Medical Case Training API
"""

import os
import sys
import re

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timedelta

from models import get_db, engine, Base, Case, User, Chat, Message, Completion
import crud
import schemas
from ai_schemas import (
    PatientSimulationRequest,
    PatientCaseContext,
    ConversationMessage,
    FeedbackGenerationRequest,
    FeedbackCaseContext,
    FeedbackConversationMessage,
)
from ai_service import generate_patient_response, generate_feedback

app = FastAPI(
    title="Medical Case Training API",
    description="API for medical student training with GP-level patient cases",
    version="2.0.0"
)

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


def get_or_create_user(db: Session) -> User:
    user = db.query(User).filter(User.username == "medstudent").first()
    if not user:
        user = User(username="medstudent", name="Dr. Candidate", specialty="General Medicine")
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


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
    return {"message": "Medical Case Training API", "version": "2.0.0", "docs": "/docs"}


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


@app.post("/api/chats", response_model=schemas.ChatResponse, status_code=201)
def create_chat(data: schemas.ChatCreate, db: Session = Depends(get_db)):
    user = get_or_create_user(db)
    case = db.query(Case).filter(Case.id == data.case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    chat = Chat(user_id=user.id, case_id=data.case_id)
    db.add(chat)
    db.commit()
    db.refresh(chat)
    
    greeting = Message(chat_id=chat.id, sender="ai", content="Hello doctor. I'm feeling not quite right today...")
    db.add(greeting)
    db.commit()
    
    return schemas.ChatResponse(id=chat.id, user_id=chat.user_id, case_id=chat.case_id, created_at=chat.created_at)


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
            id=m.id, chat_id=m.chat_id, sender=m.sender, content=m.content, created_at=m.created_at
        ) for m in messages]
    )


@app.post("/api/chats/{chat_id}/messages", response_model=schemas.MessageResponse, status_code=201)
async def send_message(chat_id: int, data: schemas.MessageCreate, db: Session = Depends(get_db)):
    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    case = db.query(Case).filter(Case.id == chat.case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    user_msg = Message(chat_id=chat_id, sender=data.sender, content=data.content)
    db.add(user_msg)
    db.commit()
    db.refresh(user_msg)
    
    if data.sender == "user":
        messages = db.query(Message).filter(Message.chat_id == chat_id).order_by(Message.created_at).all()
        history = [ConversationMessage(role="user" if m.sender == "user" else "assistant", content=m.content) for m in messages[:-1]]
        
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
                student_message=data.content
            )
            response = await generate_patient_response(request)
            ai_content = response.patient_response
        except Exception as e:
            print(f"AI error: {e}")
            ai_content = "I'm here, doctor. What would you like to know about how I'm feeling?"
        
        ai_msg = Message(chat_id=chat_id, sender="ai", content=ai_content)
        db.add(ai_msg)
        db.commit()
    
    return schemas.MessageResponse(
        id=user_msg.id, chat_id=user_msg.chat_id, sender=user_msg.sender,
        content=user_msg.content, created_at=user_msg.created_at
    )


@app.delete("/api/chats/{chat_id}/messages/last-user")
def delete_last_user_message(chat_id: int, db: Session = Depends(get_db)):
    msgs = db.query(Message).filter(Message.chat_id == chat_id).order_by(Message.created_at.desc()).all()
    deleted = 0
    for m in msgs:
        if m.sender == "user" and deleted == 0:
            db.delete(m)
            deleted += 1
        elif m.sender == "ai" and deleted == 1:
            db.delete(m)
            break
    db.commit()
    return {"success": True}


@app.post("/api/completions", response_model=schemas.CompletionResultResponse, status_code=201)
def submit_diagnosis(data: schemas.CompletionCreate, db: Session = Depends(get_db)):
    user = get_or_create_user(db)
    case = db.query(Case).filter(Case.id == data.case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    diag = data.diagnosis.lower().strip()
    expected = case.diagnosis.lower()
    
    result = "wrong"
    if diag in expected or expected in diag:
        result = "correct"
    elif any(w in expected for w in diag.split() if len(w) > 3):
        result = "partial"
    
    completion = Completion(
        user_id=user.id, case_id=data.case_id, chat_id=data.chat_id,
        diagnosis=data.diagnosis, result=result
    )
    db.add(completion)
    db.commit()
    db.refresh(completion)
    
    return schemas.CompletionResultResponse(
        completion=schemas.CompletionResponse(
            id=completion.id, user_id=completion.user_id, case_id=completion.case_id,
            chat_id=completion.chat_id, diagnosis=completion.diagnosis,
            result=completion.result, created_at=completion.created_at
        ),
        result=result
    )


@app.delete("/api/completions/retry/{chat_id}")
def retry_diagnosis(chat_id: int, db: Session = Depends(get_db)):
    completion = db.query(Completion).filter(Completion.chat_id == chat_id).order_by(Completion.created_at.desc()).first()
    if completion:
        db.delete(completion)
        db.commit()
    return {"success": True}


@app.get("/api/user/stats", response_model=schemas.UserStatsResponse)
def user_stats(db: Session = Depends(get_db)):
    user = get_or_create_user(db)
    completions = db.query(Completion).filter(
        Completion.user_id == user.id, Completion.result.in_(["correct", "partial"])
    ).all()
    
    completed_ids = list(set([c.case_id for c in completions]))
    cases_solved = len(completed_ids)
    accuracy = sum([100 if c.result == "correct" else 50 for c in completions]) / len(completions) if completions else 0
    
    streak = 0
    check_date = datetime.now().date()
    while True:
        if any(c.created_at and c.created_at.date() == check_date for c in completions):
            streak += 1
            check_date -= timedelta(days=1)
        else:
            break
    
    return schemas.UserStatsResponse(streak=streak, cases_solved=cases_solved, accuracy=accuracy, completed_case_ids=completed_ids)


@app.get("/api/user/completed-cases")
def completed_cases(db: Session = Depends(get_db)):
    user = get_or_create_user(db)
    completions = db.query(Completion).filter(
        Completion.user_id == user.id, Completion.result.in_(["correct", "partial"])
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
    
    completion = db.query(Completion).filter(Completion.chat_id == chat_id).order_by(Completion.created_at.desc()).first()
    if not completion:
        raise HTTPException(status_code=400, detail="Case not completed")
    
    messages = db.query(Message).filter(Message.chat_id == chat_id).order_by(Message.created_at).all()
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
            conversation=[FeedbackConversationMessage(sender=m.sender, content=m.content, timestamp=m.created_at) for m in messages],
            student_diagnosis=completion.diagnosis,
            diagnosis_result=completion.result,
            time_spent_seconds=None
        )
        fb = await generate_feedback(request)
        return {
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
            "userDiagnosis": fb.user_diagnosis,
            "correctDiagnosis": fb.correct_diagnosis,
            "result": fb.result
        }
    except Exception as e:
        print(f"AI feedback error: {e}")
        return generate_fallback_feedback(case, messages, completion)


def generate_fallback_feedback(case, messages, completion):
    user_msgs = [m for m in messages if m.sender == "user"]
    n = len(user_msgs)
    is_correct = completion.result == "correct"
    is_partial = completion.result == "partial"
    
    diag_pts = 40 if is_correct else (20 if is_partial else 0)
    q_pts = min(n * 4, 20)
    test_pts = 20 if is_correct else (10 if is_partial else 5)
    time_pts = 10 if n <= 8 else (7 if n <= 12 else 3)
    diff_pts = 10 if is_correct else (5 if is_partial else 2)
    
    return {
        "score": diag_pts + q_pts + test_pts + time_pts + diff_pts,
        "breakdown": {"correctDiagnosis": diag_pts, "keyQuestions": q_pts, "rightTests": test_pts, "timeEfficiency": time_pts, "ruledOutDifferentials": diff_pts},
        "decisionTree": {"id": "root", "label": case.chief_complaint or case.diagnosis, "correct": None, "children": [{"id": "diag", "label": case.diagnosis.upper(), "correct": is_correct or is_partial, "children": []}]},
        "clues": [
            {"id": "1", "text": "Chief complaint details", "importance": "critical", "asked": n >= 1},
            {"id": "2", "text": "Symptom timeline", "importance": "helpful", "asked": n >= 2},
            {"id": "3", "text": "Medical history", "importance": "minor", "asked": n >= 3}
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
