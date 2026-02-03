"""
Pydantic schemas for AI patient simulation and feedback generation
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ============================================
# PATIENT SIMULATION MODELS
# ============================================

class PatientCaseContext(BaseModel):
    """Complete case data provided to the AI for patient simulation"""
    case_id: str
    age: Optional[str] = None
    gender: Optional[str] = None
    chief_complaint: Optional[str] = None
    history: Optional[str] = None
    duration: Optional[str] = None
    severity: Optional[str] = None
    triggers: Optional[str] = None
    diagnosis: str  # The actual diagnosis (AI must NEVER reveal this)
    description: Optional[str] = None
    presenting_symptoms: list[str] = Field(default_factory=list)
    absent_symptoms: list[str] = Field(default_factory=list)
    exam_findings: list[str] = Field(default_factory=list)


class ConversationMessage(BaseModel):
    """Single message in the conversation history"""
    role: str  # "user" (student) or "assistant" (patient)
    content: str


class PatientSimulationRequest(BaseModel):
    """Request model for generating a patient response"""
    case: PatientCaseContext
    conversation_history: list[ConversationMessage] = Field(default_factory=list)
    student_message: str


class PatientSimulationResponse(BaseModel):
    """Response model from the AI patient"""
    patient_response: str
    revealed_symptoms: list[str] = Field(
        default_factory=list,
        description="Symptoms that were revealed in this response"
    )
    internal_notes: Optional[str] = Field(
        default=None,
        description="Internal tracking notes (not shown to student)"
    )


# ============================================
# FEEDBACK GENERATION MODELS
# ============================================

class FeedbackConversationMessage(BaseModel):
    """Message in the completed conversation"""
    sender: str  # "user" or "ai"
    content: str
    timestamp: Optional[datetime] = None


class FeedbackCaseContext(BaseModel):
    """Complete case data for feedback analysis"""
    case_id: str
    title: str
    description: str
    specialty: str
    difficulty: str
    expected_diagnosis: str
    acceptable_diagnoses: Optional[str] = None
    presenting_symptoms: list[str] = Field(default_factory=list)
    absent_symptoms: list[str] = Field(default_factory=list)
    exam_findings: list[str] = Field(default_factory=list)


class FeedbackGenerationRequest(BaseModel):
    """Request model for generating case feedback"""
    case: FeedbackCaseContext
    conversation: list[FeedbackConversationMessage]
    student_diagnosis: str
    diagnosis_result: str  # "correct", "partial", "wrong"
    time_spent_seconds: Optional[int] = None


class ScoreBreakdown(BaseModel):
    """Breakdown of the student's score by category"""
    correct_diagnosis: int = Field(ge=0, le=40, description="0-40 points for diagnosis accuracy")
    key_questions: int = Field(ge=0, le=20, description="0-20 points for asking key questions")
    right_tests: int = Field(ge=0, le=20, description="0-20 points for appropriate tests/exams")
    time_efficiency: int = Field(ge=0, le=10, description="0-10 points for efficient questioning")
    ruled_out_differentials: int = Field(ge=0, le=10, description="0-10 points for considering differentials")


class DecisionTreeNode(BaseModel):
    """Node in the diagnostic decision tree visualization"""
    id: str
    label: str
    type: str = Field(default="symptom", description="Node type: symptom, test, diagnosis, or ruled_out")
    asked: bool = Field(default=True, description="Whether the student asked about this")
    children: list["DecisionTreeNode"] = Field(default_factory=list)


class FeedbackSource(BaseModel):
    """Indicates whether feedback was AI-generated or fallback"""
    is_ai_generated: bool = Field(description="True if feedback came from AI, False if fallback was used")
    reason: Optional[str] = Field(default=None, description="Reason for fallback if applicable")


class MissedClue(BaseModel):
    """A symptom or finding the student may have missed"""
    id: str
    text: str
    importance: str = Field(description="critical, helpful, or minor")
    asked: bool = Field(description="Whether the student asked about this")


class AIInsight(BaseModel):
    """Personalized feedback from the AI"""
    summary: str = Field(description="2-3 sentence overall assessment")
    strengths: list[str] = Field(description="2-4 things the student did well")
    improvements: list[str] = Field(description="2-4 areas to improve")
    tip: str = Field(description="One actionable tip for next time")


class FeedbackGenerationResponse(BaseModel):
    """Complete feedback response for the student"""
    score: int = Field(ge=0, le=100, description="Total score out of 100")
    breakdown: ScoreBreakdown
    decision_tree: DecisionTreeNode
    clues: list[MissedClue]
    insight: AIInsight
    user_diagnosis: str
    correct_diagnosis: str
    result: str  # "correct", "partial", "wrong"
    source: FeedbackSource = Field(description="Indicates if feedback is AI-generated or fallback")


# Required for self-referencing model
DecisionTreeNode.model_rebuild()
