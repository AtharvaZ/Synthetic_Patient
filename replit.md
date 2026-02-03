# ClinIQ - Medical Training Platform

## Overview

ClinIQ is a medical education platform that helps medical students practice clinical diagnosis through interactive case simulations with AI-powered patient conversations.

## Design System

**Theme**: Modern dark/light theme with teal-green primary (hsl(168,84%,45%)) and purple accent (hsl(280,75%,60%))

**UI Features**:
- Glassmorphism effects with subtle noise texture overlay
- Framer Motion animations throughout
- Gradient buttons and cards
- Dark mode: hsl(220,15%,5%) background
- Light mode: hsl(220,20%,97%) background

**CSS Utility Classes**:
- `.btn-primary` - Gradient primary button with hover effects
- `.card-elevated` - Glassmorphism card styling
- `.text-gradient-primary` - Gradient text effect
- `.noise-overlay` - Subtle texture overlay
- `.hover-lift` - Lift animation on hover

## Architecture

**Frontend (Port 5000)**: React + Express.js serving the UI, managing chat state in React, storing user progress in localStorage, and proxying API requests to backend
**Backend API (Port 8000)**: FastAPI serving case data and providing stateless AI processing endpoints (no session/user persistence)

## Recent Changes (Feb 2026)

### LocalStorage-Based Architecture
- User progress (completed cases, stats, streaks) stored in localStorage
- Chat sessions managed in React state (session-based, not persisted)
- Feedback stored in sessionStorage after diagnosis submission
- Database now only stores the 62 validated clinical cases (read-only)
- Removed database persistence for users, chats, messages, and completions

### Stateless Backend
- `/api/patient-message`: Receives case data + conversation, returns AI patient response
- `/api/submit-diagnosis`: Receives full conversation + diagnosis, returns result + feedback
- All endpoints are stateless - no session management on backend

### AI Integration
- Gemini AI integration for realistic patient simulation
- Patient simulation prompt with ambiguity rules, symptom disclosure, consistency
- AI-generated feedback with structured scoring and personalized insights
- Automatic symptom extraction from case descriptions

### Feedback System
- Visual Feedback page with 5 core components:
  - Animated Score Ring (green 80+, yellow 60-79, red <60)
  - Diagnostic Decision Tree showing conversation path
  - Missed Clues Checklist with importance levels
  - Similar Cases Carousel
  - AI Personalized Insight

## Project Structure

```
├── backend/                    # FastAPI Backend (Port 8000)
│   ├── main.py                 # FastAPI app with all endpoints
│   ├── models.py               # SQLAlchemy models (Case, User, Chat, Message, Completion)
│   ├── crud.py                 # CRUD operations for cases
│   ├── schemas.py              # Pydantic schemas
│   ├── ai_schemas.py           # AI request/response schemas
│   ├── ai_service.py           # Gemini AI integration
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
│   │   └── routes.ts           # Proxy routes to backend
│   └── shared/                 # Shared types/schema
│
└── package.json
```

## API Endpoints

### Backend API (FastAPI - Port 8000)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API info |
| GET | `/api/health` | Health check |
| GET | `/api/stats` | Database statistics |
| GET | `/api/cases` | List all cases |
| GET | `/api/cases/{id}` | Get single case |
| GET | `/api/cases/difficulty/{level}` | Cases by difficulty |
| POST | `/api/chats` | Create chat session |
| GET | `/api/chats/{id}` | Get chat with messages |
| POST | `/api/chats/{id}/messages` | Send message (triggers AI response) |
| DELETE | `/api/chats/{id}/messages/last-user` | Delete last user message |
| POST | `/api/completions` | Submit diagnosis |
| DELETE | `/api/completions/retry/{chatId}` | Retry diagnosis |
| GET | `/api/user/stats` | User progress stats |
| GET | `/api/user/completed-cases` | Completed case IDs |
| GET | `/api/feedback/{chatId}` | AI-generated feedback |

### Frontend API (Express - Port 5000)
All endpoints proxy to the backend with camelCase transformation.

## Database Schema

```sql
-- Existing tables
cases, symptoms, case_symptoms

-- New tables
users (id, username, name, avatar_url, specialty, created_at)
chats (id, user_id, case_id, created_at)
messages (id, chat_id, sender, content, created_at)
completions (id, user_id, case_id, chat_id, diagnosis, result, created_at)
```

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
- Google Gemini AI (with fallback responses)
- PostgreSQL
