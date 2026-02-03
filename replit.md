<<<<<<< HEAD
# Medical Case Viewer - GP Training Dataset

## Overview
Medical student training API with GP-level patient cases for diagnostic skill practice.

## Current State
- **62 unique cases** from 2 validated datasets stored in PostgreSQL
- FastAPI backend with SQLAlchemy ORM
- Full CRUD operations for cases and symptoms

## Database Schema
```sql
symptoms (id, name, category, severity_weight)
cases (id, case_id, age, gender, chief_complaint, history, duration, severity, triggers, diagnosis, description, difficulty, source)
case_symptoms (id, case_id, symptom_id, symptom_type: presenting/absent/exam_finding)
```

## Data Sources
1. **Kaggle Disease Symptom Dataset** (24 cases)
2. **MedQuAD - Medical Question Answering Dataset** (38 cases)

## Project Structure
```
backend/
├── main.py              # FastAPI app with endpoints (auto-creates tables on startup)
├── models.py            # SQLAlchemy connection, session, and ORM models
├── crud.py              # CRUD operations
├── schemas.py           # Pydantic schemas for API
├── seed_data.py         # Script to populate database from training_cases.json
├── requirements.txt     # Python dependencies
├── .env.example         # Environment variable template
└── training_cases.json  # Case data (62 cases)
```

## API Endpoints
- `GET /` - API info
- `GET /docs` - Interactive API documentation (Swagger)
- `GET /api/stats` - Database statistics
- `GET /api/cases` - All cases with symptoms
- `GET /api/cases/{id}` - Single case detail
- `POST /api/cases` - Create new case
- `PUT /api/cases/{id}` - Update case
- `DELETE /api/cases/{id}` - Delete case
- `GET /api/symptoms` - All symptoms
- `POST /api/symptoms` - Create symptom
- `DELETE /api/symptoms/{id}` - Delete symptom
- `POST /api/cases/{id}/symptoms` - Add symptom to case
- `DELETE /api/cases/{id}/symptoms/{symptom_id}` - Remove symptom
- `GET /api/search/symptom/{name}` - Search cases by symptom
- `GET /api/search/diagnosis/{name}` - Search cases by diagnosis

## Local Setup (New Database)
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your DATABASE_URL
python seed_data.py      # Populate database with 62 cases
uvicorn main:app --reload --port 5000
```

Tables are created automatically on app startup. The seed script loads all cases from training_cases.json.

## How to Run (Replit)
FastAPI app runs on port 5000 via workflow: `cd backend && python main.py`

## Next Steps
- Build training app with AI patient simulator
- Integrate with frontend (separate repo)
=======
# CaseLab - Frontend

## Overview

CaseLab is a medical education platform that helps medical students practice clinical diagnosis through interactive case simulations with AI-powered patient conversations. This is the frontend branch with React + Express.

## Recent Changes (Feb 2026)

- Added visual Feedback page with 5 core components:
  - Animated Score Ring (green 80+, yellow 60-79, red <60) with point breakdown
  - Diagnostic Decision Tree showing conversation path to diagnosis
  - Missed Clues Checklist with critical/helpful/minor importance levels
  - Similar Cases Carousel for related practice cases
  - AI Personalized Insight with strengths, improvements, and tips
- Feedback data derived from actual case description and conversation history
- Graceful handling for incomplete cases with "Continue Case" navigation
- Added diagnosis workflow with popup feedback (correct/partial/wrong)
- Server-side diagnosis evaluation based on case-specific expected diagnoses
- Retry functionality that properly resets completion records
- Next Patient navigation that excludes completed cases
- Dashboard shows real stats from database (streak, cases solved, accuracy)
- Cases organized by difficulty with completion progress tracking

## Local Setup

```bash
# 1. Clone and install
git clone <repo-url>
cd meditutor
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your DATABASE_URL

# 3. Push database schema
npm run db:push

# 4. Run development server
npm run dev
```

The app will be available at `http://localhost:5000`

## Project Structure

```
├── frontend/
│   ├── client/              # React frontend (Vite)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   └── lib/
│   │   └── index.html
│   ├── server/              # Express backend
│   │   ├── index.ts
│   │   ├── routes.ts
│   │   └── storage.ts
│   ├── shared/              # Shared types/schema
│   │   ├── schema.ts
│   │   └── routes.ts
│   ├── script/              # Build scripts
│   ├── vite.config.ts       # Vite configuration
│   ├── tsconfig.json        # TypeScript configuration
│   ├── tailwind.config.ts   # Tailwind CSS configuration
│   ├── drizzle.config.ts    # Drizzle ORM configuration
│   └── components.json      # Shadcn/ui configuration
│   client/
│   └── postcss.config.js    # PostCSS configuration
├── package.json
└── .env.example
```

## Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: Wouter
- **State Management**: TanStack React Query
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui (Radix UI)
- **Animations**: Framer Motion

### Backend
- **Framework**: Express.js 5.x with TypeScript
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL
- **Validation**: Zod

## NPM Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Run production build
- `npm run check` - TypeScript check
- `npm run db:push` - Push schema to database

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NODE_ENV` | `development` or `production` |
| `PORT` | Server port (default: 5000) |

## Path Aliases

- `@/` → `frontend/client/src/`
- `@shared/` → `frontend/shared/`
>>>>>>> frontend
