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
- Claude AI (Anthropic) integration for realistic patient simulation
- Uses claude-3-5-haiku model for fast, cost-effective responses
- Patient simulation prompt with ambiguity rules, symptom disclosure, consistency
- AI-generated feedback with structured scoring and personalized insights
- Automatic symptom extraction from case descriptions
- Smart fallback system when AI is unavailable

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
│   ├── ai_service.py           # Claude AI integration
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
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude AI |
| `BACKEND_URL` | Backend API URL (default: http://localhost:8000) |

## Local Development Setup

This guide helps you run ClinIQ on your local machine. You'll use your own local PostgreSQL database instead of Replit's.

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+ (3.11+ recommended)
- **PostgreSQL** 14+ (local installation)
- **Git** (for cloning the repository)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd Synthetic_Patient
```

### Step 2: Install PostgreSQL

**macOS (using Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15

# If createdb command is not found, add PostgreSQL to PATH:
# For Homebrew on Apple Silicon:
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
# For Homebrew on Intel:
export PATH="/usr/local/opt/postgresql@15/bin:$PATH"
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)
Make sure to add PostgreSQL to your system PATH during installation.

### Step 3: Create a Local Database

**macOS (if createdb is not in PATH):**
```bash
# Use full path to createdb
/opt/homebrew/opt/postgresql@15/bin/createdb cliniq
```

**Linux/Windows:**
```bash
# Create the database
createdb cliniq
```

**Alternative (using psql):**
```bash
psql postgres
CREATE DATABASE cliniq;
\q
```

**Note for macOS:** If you get "role postgres does not exist", use your macOS username instead:
```bash
# Replace 'your_username' with your actual macOS username
createdb -U your_username cliniq
```

### Step 4: Install Frontend Dependencies

```bash
# From project root
npm install
```

This will install all Node.js dependencies defined in `package.json`.

### Step 5: Set Up Python Virtual Environment

**macOS/Linux:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

**Windows:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

**Note:** Always activate the virtual environment before running backend commands:
- macOS/Linux: `source venv/bin/activate`
- Windows: `venv\Scripts\activate`

### Step 6: Configure Environment Variables

Create a `.env` file in the `backend/` folder:

```bash
cd backend
touch .env  # or create manually
```

Add the following content to `backend/.env`:

```bash
# Required - PostgreSQL connection string
# For macOS with Homebrew (use your macOS username):
DATABASE_URL=postgresql://your_username@localhost:5432/cliniq

# For Linux/Windows (default postgres user):
# DATABASE_URL=postgresql://postgres@localhost:5432/cliniq

# Optional - Google Gemini API key for AI patient conversations
# Get your key from https://aistudio.google.com/apikey
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

**Important Notes:**
- Replace `your_username` with your actual macOS username (run `whoami` to find it)
- `DATABASE_URL` is **required** - the app won't start without it
- `ANTHROPIC_API_KEY` is optional; without it, AI patient responses will use basic fallback messages
- The `.env` file is gitignored and won't be committed to the repository

### Step 7: Seed the Database

This populates your database with the 62 clinical training cases:

```bash
cd backend
source venv/bin/activate  # Activate virtual environment (Windows: venv\Scripts\activate)
python seed_data.py
```

You should see output like:
```
Loading 62 cases...
  Added: common_cold
  Added: fungal_infection
  ...
Seeding complete!
  Cases: 62
  Symptoms: 294
```

### Step 8: Configure VS Code (Optional but Recommended)

Create `.vscode/settings.json` in the project root:

```json
{
  "python.defaultInterpreterPath": "${workspaceFolder}/backend/venv/bin/python"
}
```

This ensures VS Code uses the correct Python interpreter and resolves import errors.

### Step 9: Run the Application

Open **two separate terminal windows/tabs**:

**Terminal 1 - Backend API (Port 8000):**
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python main.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

**Terminal 2 - Frontend (Port 5000):**
```bash
# From project root
npm run dev
```

You should see:
```
🚀 Server running at http://127.0.0.1:5000
   Also available at http://localhost:5000
```

### Step 10: Access the Application

Open your browser and navigate to:
- **Frontend:** http://localhost:5000 or http://127.0.0.1:5000
- **Backend API Docs:** http://localhost:8000/docs
- **Backend Health Check:** http://localhost:8000/api/health

### Troubleshooting

**Database connection errors:**
```bash
# Verify PostgreSQL is running
pg_isready
# or
brew services list  # macOS

# Check if database exists
psql -l | grep cliniq
# or
psql -U your_username -l  # macOS with username

# Test connection
psql -U your_username -d cliniq  # macOS
psql -U postgres -d cliniq      # Linux/Windows
```

**"createdb: command not found" (macOS):**
```bash
# Add PostgreSQL to PATH (add to ~/.zshrc or ~/.bash_profile)
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
source ~/.zshrc  # or source ~/.bash_profile
```

**"role postgres does not exist" (macOS):**
- Use your macOS username in DATABASE_URL instead of `postgres`
- Run `whoami` to find your username
- Update `backend/.env` with: `DATABASE_URL=postgresql://your_username@localhost:5432/cliniq`

**Port already in use:**
```bash
# Find process using port 8000
lsof -ti:8000  # macOS/Linux
# Kill the process
kill -9 $(lsof -ti:8000)

# Find process using port 5000
lsof -ti:5000
kill -9 $(lsof -ti:5000)
```

**Python virtual environment issues:**
```bash
# If venv creation fails, try with full permissions
python3 -m venv venv --system-site-packages

# If pip install fails, upgrade pip first
pip install --upgrade pip
pip install -r requirements.txt
```

**Frontend "access to localhost denied" error:**
- Ensure backend is running on port 8000
- Check `frontend/server/routes.ts` has `BACKEND_URL=http://127.0.0.1:8000`
- Restart both servers after making changes

**Import errors in VS Code:**
- Ensure `.vscode/settings.json` points to the virtual environment
- Reload VS Code window (Cmd+Shift+P → "Reload Window")
- Check Python interpreter in bottom-right of VS Code

**Missing dependencies:**
```bash
# Frontend
npm install

# Backend (with venv activated)
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

**Database seeding fails:**
- Ensure database exists: `createdb cliniq`
- Check DATABASE_URL in `backend/.env` is correct
- Verify PostgreSQL is running
- Try dropping and recreating the database:
  ```bash
  dropdb cliniq
  createdb cliniq
  python seed_data.py
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
