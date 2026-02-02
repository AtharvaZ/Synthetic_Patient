"""
Pydantic schemas for API request/response validation
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SymptomBase(BaseModel):
    name: str
    category: Optional[str] = None
    severity_weight: Optional[int] = 3


class SymptomCreate(SymptomBase):
    pass


class SymptomResponse(SymptomBase):
    id: int
    
    class Config:
        from_attributes = True


class CaseSymptomBase(BaseModel):
    symptom_id: int
    symptom_type: str


class CaseSymptomCreate(CaseSymptomBase):
    pass


class CaseSymptomResponse(CaseSymptomBase):
    id: int
    case_id: int
    symptom: SymptomResponse
    
    class Config:
        from_attributes = True


class CaseBase(BaseModel):
    case_id: str
    age: Optional[str] = None
    gender: Optional[str] = None
    chief_complaint: Optional[str] = None
    history: Optional[str] = None
    duration: Optional[str] = None
    severity: Optional[str] = None
    triggers: Optional[str] = None
    diagnosis: str
    description: Optional[str] = None
    difficulty: Optional[int] = 2
    source: Optional[str] = None


class CaseCreate(CaseBase):
    pass


class CaseUpdate(BaseModel):
    age: Optional[str] = None
    gender: Optional[str] = None
    chief_complaint: Optional[str] = None
    history: Optional[str] = None
    duration: Optional[str] = None
    severity: Optional[str] = None
    triggers: Optional[str] = None
    diagnosis: Optional[str] = None
    description: Optional[str] = None
    difficulty: Optional[int] = None
    source: Optional[str] = None


class CaseResponse(CaseBase):
    id: int
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class CaseDetailResponse(CaseResponse):
    presenting_symptoms: list[str] = []
    absent_symptoms: list[str] = []
    exam_findings: list[str] = []


class CaseListResponse(BaseModel):
    total: int
    cases: list[CaseDetailResponse]


class StatsResponse(BaseModel):
    total_cases: int
    total_symptoms: int
    easy_count: int
    medium_count: int
    hard_count: int
    presenting_count: int
    absent_count: int
    exam_finding_count: int
