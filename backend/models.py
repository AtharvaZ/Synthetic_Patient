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


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False)
    name = Column(String(200))
    avatar_url = Column(Text)
    specialty = Column(String(100))
    created_at = Column(DateTime, server_default=func.now())
    
    chats = relationship("Chat", back_populates="user")
    completions = relationship("Completion", back_populates="user")


class Chat(Base):
    __tablename__ = "chats"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    case_id = Column(Integer, ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    
    user = relationship("User", back_populates="chats")
    case = relationship("Case")
    messages = relationship("Message", back_populates="chat", cascade="all, delete-orphan", order_by="Message.created_at")
    completions = relationship("Completion", back_populates="chat")


class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(Integer, ForeignKey("chats.id", ondelete="CASCADE"), nullable=False)
    sender = Column(String(20), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    
    __table_args__ = (
        CheckConstraint(sender.in_(['user', 'ai']), name='check_sender_type'),
    )
    
    chat = relationship("Chat", back_populates="messages")


class Completion(Base):
    __tablename__ = "completions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    case_id = Column(Integer, ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)
    chat_id = Column(Integer, ForeignKey("chats.id", ondelete="CASCADE"), nullable=False)
    diagnosis = Column(Text, nullable=False)
    result = Column(String(20), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    
    __table_args__ = (
        CheckConstraint(result.in_(['correct', 'partial', 'wrong']), name='check_result_type'),
    )
    
    user = relationship("User", back_populates="completions")
    case = relationship("Case")
    chat = relationship("Chat", back_populates="completions")
