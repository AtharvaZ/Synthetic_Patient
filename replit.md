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

## Local Development Setup

This guide helps you run ClinIQ on your local machine. You'll use your own local PostgreSQL database instead of Replit's.

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- **PostgreSQL** 14+ (local installation)

### Step 1: Install PostgreSQL

**macOS (using Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)

### Step 2: Create a Local Database

```bash
# Create the database
createdb cliniq

# (Optional) Create a dedicated user
psql -c "CREATE USER cliniq_user WITH PASSWORD 'your_password';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE cliniq TO cliniq_user;"
```

### Step 3: Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd cliniq

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
pip install -r requirements.txt
cd ..
```

### Step 4: Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Database - use YOUR local PostgreSQL credentials
DATABASE_URL=postgresql://yourusername:yourpassword@localhost:5432/cliniq

# Or if using default postgres user with no password:
DATABASE_URL=postgresql://postgres@localhost:5432/cliniq

# AI Integration (optional but recommended)
# Get your API key from https://aistudio.google.com/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# Backend URL (default for local development)
BACKEND_URL=http://localhost:8000
```

**Note:** The `GEMINI_API_KEY` is optional. Without it, AI patient responses will use basic fallback messages instead of realistic simulated conversations.

### Step 5: Seed the Database

This populates your database with the 62 clinical training cases:

```bash
cd backend
python seed_data.py
```

You should see output confirming cases were inserted.

### Step 6: Run the Application

Open **two terminal windows**:

**Terminal 1 - Backend API (Port 8000):**
```bash
cd backend
python main.py
```

**Terminal 2 - Frontend (Port 5000):**
```bash
npm run dev
```

### Step 7: Access the Application

Open your browser and navigate to: **http://localhost:5000**

### Troubleshooting

**Database connection errors:**
- Verify PostgreSQL is running: `pg_isready`
- Check your DATABASE_URL credentials match your local setup
- Ensure the database exists: `psql -l | grep cliniq`

**Port already in use:**
- Backend: Change port in `backend/main.py`
- Frontend: Update port in `package.json` scripts

**Missing Python packages:**
```bash
cd backend && pip install -r requirements.txt
```

**Missing Node packages:**
```bash
npm install
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
