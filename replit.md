# CaseLab - Medical Training Platform

## Overview

CaseLab is a medical education platform that helps medical students practice clinical diagnosis through interactive case simulations with AI-powered patient conversations.

## Architecture

**Frontend (Port 5000)**: React + Express.js serving the UI and proxying AI requests
**Backend API (Port 8000)**: FastAPI providing case data and AI endpoints

## Recent Changes (Feb 2026)

### AI Integration
- Added Gemini AI integration for realistic patient simulation
- Extensive patient simulation prompt with:
  - Symptom disclosure rules (only reveal when asked)
  - Ambiguity guidelines (vague initial responses, require follow-up)
  - Consistency requirements (no contradictions)
  - Exam findings revealed only when student examines
- AI-generated feedback with structured scoring and personalized insights
- Automatic symptom extraction from case descriptions

### Feedback System
- Visual Feedback page with 5 core components:
  - Animated Score Ring (green 80+, yellow 60-79, red <60) with point breakdown
  - Diagnostic Decision Tree showing conversation path to diagnosis
  - Missed Clues Checklist with critical/helpful/minor importance levels
  - Similar Cases Carousel for related practice cases
  - AI Personalized Insight with strengths, improvements, and tips

### Completion Logic
- Only correct/partial diagnoses mark cases as completed
- Accuracy calculated as weighted average (correct=100, partial=50, wrong=0)

## Project Structure

```
├── backend/                    # FastAPI Backend (Port 8000)
│   ├── main.py                 # FastAPI app with all endpoints
│   ├── models.py               # SQLAlchemy models
│   ├── crud.py                 # CRUD operations
│   ├── schemas.py              # Pydantic schemas for cases
│   ├── ai_schemas.py           # Pydantic schemas for AI endpoints
│   ├── ai_service.py           # Gemini AI integration + prompts
│   ├── seed_data.py            # Database seeding script
│   └── training_cases.json     # 62 validated medical cases
│
├── frontend/                   # React + Express Frontend (Port 5000)
│   ├── client/                 # React frontend (Vite)
│   │   ├── src/
│   │   │   ├── components/     # UI components
│   │   │   ├── pages/          # Page components
│   │   │   ├── hooks/          # React hooks
│   │   │   └── lib/            # Utilities
│   │   └── index.html
│   ├── server/                 # Express backend
│   │   ├── index.ts
│   │   ├── routes.ts           # API routes (calls backend AI)
│   │   └── storage.ts          # In-memory storage
│   └── shared/                 # Shared types/schema
│
└── package.json
```

## API Endpoints

### Backend API (FastAPI - Port 8000)
- `POST /api/ai/patient-response` - Generate AI patient response
- `POST /api/ai/generate-feedback` - Generate AI feedback for completed case
- `GET /api/cases` - All cases with symptoms
- `GET /api/cases/{id}` - Single case detail
- `GET /api/stats` - Database statistics

### Frontend API (Express - Port 5000)
- `GET /api/cases` - List all cases
- `POST /api/chats` - Create new chat session
- `POST /api/chats/:id/messages` - Send message (triggers AI response)
- `POST /api/completions` - Submit diagnosis
- `GET /api/feedback/:chatId` - Get AI-generated feedback
- `GET /api/user/stats` - User progress stats

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `GEMINI_API_KEY` | Google Gemini API key for AI |
| `BACKEND_URL` | Backend API URL (default: http://localhost:8000) |

## Local Setup

```bash
# 1. Install dependencies
npm install
cd backend && pip install -r requirements.txt

# 2. Set up environment
cp .env.example .env
# Add GEMINI_API_KEY and DATABASE_URL

# 3. Seed database (optional)
cd backend && python seed_data.py

# 4. Run both servers
# Terminal 1: cd backend && python main.py
# Terminal 2: npm run dev
```

## Tech Stack

### Frontend
- React 18 + TypeScript + Vite
- TanStack React Query
- Tailwind CSS + Shadcn/ui
- Framer Motion

### Backend
- FastAPI + SQLAlchemy
- Google Gemini AI (gemini-2.5-flash)
- PostgreSQL

## AI Prompt Design

### Patient Simulation
- Only reveals symptoms when directly/indirectly asked
- Uses vague, patient-like language initially
- Denies absent symptoms clearly
- Reveals exam findings only when student examines
- Never reveals the diagnosis

### Feedback Generation
- Scores across 5 categories (diagnosis, questions, tests, efficiency, differentials)
- Builds decision tree from actual conversation
- Identifies missed clues with importance levels
- Provides personalized strengths, improvements, and tips
