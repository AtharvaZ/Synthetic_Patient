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


class UserCreate(BaseModel):
    username: str
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    specialty: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    username: str
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    specialty: Optional[str] = None
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class ChatCreate(BaseModel):
    case_id: int


class MessageCreate(BaseModel):
    content: str
    sender: str = "user"


class MessageResponse(BaseModel):
    id: int
    chat_id: int
    sender: str
    content: str
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class ChatResponse(BaseModel):
    id: int
    user_id: int
    case_id: int
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class ChatDetailResponse(ChatResponse):
    messages: list[MessageResponse] = []


class CompletionCreate(BaseModel):
    case_id: int
    chat_id: int
    diagnosis: str


class CompletionResponse(BaseModel):
    id: int
    user_id: int
    case_id: int
    chat_id: int
    diagnosis: str
    result: str
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class CompletionResultResponse(BaseModel):
    completion: CompletionResponse
    result: str


class UserStatsResponse(BaseModel):
    streak: int
    cases_solved: int
    accuracy: float
    completed_case_ids: list[int]


class FrontendCaseResponse(BaseModel):
    id: int
    title: str
    description: str
    specialty: str
    difficulty: str
    expected_diagnosis: str
    acceptable_diagnoses: str
    image_url: Optional[str] = None
    status: str = "available"
    has_exams: bool = False
    
    class Config:
        from_attributes = True
