"""
Database connection, session management, and ORM models for medical case database
"""

import os
from sqlalchemy import create_engine, Column, Integer, String, Text, ForeignKey, CheckConstraint, DateTime, func
from sqlalchemy.orm import sessionmaker, declarative_base, relationship

DATABASE_URL = os.environ.get('DATABASE_URL')

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class Symptom(Base):
    __tablename__ = "symptoms"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    category = Column(String(50))
    severity_weight = Column(Integer, default=3)
    
    case_symptoms = relationship("CaseSymptom", back_populates="symptom")


class Case(Base):
    __tablename__ = "cases"
    
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(String(100), unique=True, nullable=False)
    age = Column(String(30))
    gender = Column(String(20))
    chief_complaint = Column(Text)
    history = Column(Text)
    duration = Column(String(50))
    severity = Column(String(50))
    triggers = Column(Text)
    diagnosis = Column(String(200), nullable=False)
    description = Column(Text)
    difficulty = Column(Integer, default=2)
    source = Column(String(50))
    created_at = Column(DateTime, server_default=func.now())
    
    case_symptoms = relationship("CaseSymptom", back_populates="case", cascade="all, delete-orphan")


class CaseSymptom(Base):
    __tablename__ = "case_symptoms"
    
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)
    symptom_id = Column(Integer, ForeignKey("symptoms.id", ondelete="CASCADE"), nullable=False)
    symptom_type = Column(String(20), nullable=False)
    
    __table_args__ = (
        CheckConstraint(symptom_type.in_(['presenting', 'absent', 'exam_finding']), name='check_symptom_type'),
    )
    
    case = relationship("Case", back_populates="case_symptoms")
    symptom = relationship("Symptom", back_populates="case_symptoms")
