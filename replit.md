# MediTutor AI - Clinical Diagnosis Training Platform

## Overview

MediTutor AI is an educational medical training application that uses AI-powered synthetic patients to help users practice clinical diagnosis skills. The platform presents medical case scenarios where users interact with AI-generated patient responses to develop their diagnostic reasoning abilities.

The application follows a full-stack architecture with a Python backend (FastAPI) and a React/TypeScript frontend, utilizing Google's Generative AI (Gemini) for generating realistic patient conversations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with dark mode support
- **Build Tool**: Vite (inferred from modern React/TS setup)
- **State Management**: Local storage for user progress tracking (completed cases, attempts, stats, streaks)
- **Design**: Modern UI with animations (float, fade-in, slide-up effects) and gradient text styling

### Backend Architecture
- **Framework**: FastAPI (Python 3.11)
- **AI Service**: Google Generative AI (Gemini) for patient response generation
- **API Pattern**: RESTful endpoints for patient interactions
- **Error Handling**: Retry logic with tenacity library for API resilience

### Key Components
1. **Patient Message Endpoint** (`/patient_message`): Handles user queries and generates AI patient responses
2. **AI Service Layer** (`ai_service.py`): Manages Google Gemini API interactions for generating contextual patient responses
3. **Local Storage System**: Client-side persistence for tracking user progress, case completions, and learning streaks

### Data Models
- **CompletedCase**: Tracks finished cases with diagnosis, result (correct/partial/wrong), and scoring
- **CaseAttempt**: Records individual attempts with timestamps
- **UserStats**: Aggregates overall performance metrics
- **StreakData**: Monitors consecutive completion streaks for gamification

## External Dependencies

### AI/ML Services
- **Google Generative AI (Gemini)**: Primary AI model for generating synthetic patient responses
  - Uses `google-genai` Python SDK
  - Requires `GOOGLE_API_KEY` or equivalent credential
  - Subject to rate limiting (429 quota errors observed)

### Frontend CDN Dependencies
- **Tailwind CSS**: Via CDN for styling
- **Google Fonts**: Inter font family

### Python Libraries
- **FastAPI**: Web framework
- **Tenacity**: Retry logic for API calls
- **google-genai**: Google AI SDK

### Environment Variables Required
- Google AI API credentials for Gemini model access