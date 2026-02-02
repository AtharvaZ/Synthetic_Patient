"""
FastAPI Medical Case Training API
"""

import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Optional

from models import get_db, engine, Base
import crud
import schemas

app = FastAPI(
    title="Medical Case Training API",
    description="API for medical student training with GP-level patient cases",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {"message": "Medical Case Training API", "docs": "/docs"}


@app.get("/api/stats", response_model=schemas.StatsResponse)
def get_stats(db: Session = Depends(get_db)):
    return crud.get_stats(db)


@app.get("/api/cases", response_model=schemas.CaseListResponse)
def get_cases(
    difficulty: Optional[int] = Query(None, ge=1, le=3),
    db: Session = Depends(get_db)
):
    cases = crud.get_all_cases_detail(db, difficulty=difficulty)
    return {"total": len(cases), "cases": cases}


@app.get("/api/cases/{case_id}", response_model=schemas.CaseDetailResponse)
def get_case(case_id: int, db: Session = Depends(get_db)):
    case = crud.get_case_detail(db, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case


@app.post("/api/cases", response_model=schemas.CaseResponse)
def create_case(case: schemas.CaseCreate, db: Session = Depends(get_db)):
    existing = crud.get_case_by_case_id(db, case.case_id)
    if existing:
        raise HTTPException(status_code=400, detail="Case with this case_id already exists")
    return crud.create_case(db, case)


@app.put("/api/cases/{case_id}", response_model=schemas.CaseResponse)
def update_case(case_id: int, case_update: schemas.CaseUpdate, db: Session = Depends(get_db)):
    updated = crud.update_case(db, case_id, case_update)
    if not updated:
        raise HTTPException(status_code=404, detail="Case not found")
    return updated


@app.delete("/api/cases/{case_id}")
def delete_case(case_id: int, db: Session = Depends(get_db)):
    if not crud.delete_case(db, case_id):
        raise HTTPException(status_code=404, detail="Case not found")
    return {"message": "Case deleted successfully"}


@app.get("/api/symptoms", response_model=list[schemas.SymptomResponse])
def get_symptoms(
    category: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return crud.get_symptoms(db, category=category, skip=skip, limit=limit)


@app.get("/api/symptoms/{symptom_id}", response_model=schemas.SymptomResponse)
def get_symptom(symptom_id: int, db: Session = Depends(get_db)):
    symptom = crud.get_symptom(db, symptom_id)
    if not symptom:
        raise HTTPException(status_code=404, detail="Symptom not found")
    return symptom


@app.post("/api/symptoms", response_model=schemas.SymptomResponse)
def create_symptom(symptom: schemas.SymptomCreate, db: Session = Depends(get_db)):
    existing = crud.get_symptom_by_name(db, symptom.name)
    if existing:
        raise HTTPException(status_code=400, detail="Symptom already exists")
    return crud.create_symptom(db, symptom)


@app.delete("/api/symptoms/{symptom_id}")
def delete_symptom(symptom_id: int, db: Session = Depends(get_db)):
    if not crud.delete_symptom(db, symptom_id):
        raise HTTPException(status_code=404, detail="Symptom not found")
    return {"message": "Symptom deleted successfully"}


@app.post("/api/cases/{case_id}/symptoms")
def add_symptom_to_case(
    case_id: int,
    symptom_data: schemas.CaseSymptomCreate,
    db: Session = Depends(get_db)
):
    case = crud.get_case(db, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    symptom = crud.get_symptom(db, symptom_data.symptom_id)
    if not symptom:
        raise HTTPException(status_code=404, detail="Symptom not found")
    
    return crud.add_case_symptom(db, case_id, symptom_data.symptom_id, symptom_data.symptom_type)


@app.delete("/api/cases/{case_id}/symptoms/{case_symptom_id}")
def remove_symptom_from_case(case_id: int, case_symptom_id: int, db: Session = Depends(get_db)):
    if not crud.remove_case_symptom(db, case_symptom_id):
        raise HTTPException(status_code=404, detail="Case symptom not found")
    return {"message": "Symptom removed from case"}


@app.get("/api/search/symptom/{symptom_name}")
def search_by_symptom(symptom_name: str, db: Session = Depends(get_db)):
    cases = crud.search_cases_by_symptom(db, symptom_name)
    return {"total": len(cases), "cases": cases}


@app.get("/api/search/diagnosis/{diagnosis}")
def search_by_diagnosis(diagnosis: str, db: Session = Depends(get_db)):
    cases = crud.search_cases_by_diagnosis(db, diagnosis)
    return {"total": len(cases), "cases": cases}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
