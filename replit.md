# Medical Case Viewer - GP Training Dataset

## Overview
Medical student training API with GP-level patient cases for diagnostic skill practice.

## Current State
- **62 unique cases** from 2 validated datasets stored in PostgreSQL
- FastAPI backend with SQLAlchemy ORM
- Full CRUD operations for cases, symptoms, and precautions

## Database Schema
```sql
symptoms (id, name, category, severity_weight)
cases (id, case_id, age, gender, chief_complaint, history, duration, severity, triggers, diagnosis, description, difficulty, source)
case_symptoms (id, case_id, symptom_id, symptom_type: presenting/absent/exam_finding)
precautions (id, case_id, precaution)
```

## Data Sources
1. **Kaggle Disease Symptom Dataset** (24 cases)
2. **MedQuAD - Medical Question Answering Dataset** (38 cases)

## Project Structure
```
backend/
├── main.py              # FastAPI app with endpoints
├── models.py            # SQLAlchemy connection, session, and ORM models
├── crud.py              # CRUD operations
├── schemas.py           # Pydantic schemas for API
├── db_setup.py          # Database schema creation
├── requirements.txt     # Python dependencies
├── .env.example         # Environment variable template
└── training_cases.json  # Backup data
```

## API Endpoints
- `GET /` - Web viewer (HTML)
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

## Local Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
export DATABASE_URL="postgresql://..."
uvicorn main:app --reload --port 5000
```

## How to Run (Replit)
FastAPI app runs on port 5000 via workflow: `cd backend && python main.py`

## Next Steps
- Build training app with AI patient simulator
- Integrate with frontend (separate repo)
