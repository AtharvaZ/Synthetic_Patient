# Medical Case Viewer - GP Training Dataset

## Overview
Medical student training application with GP-level patient cases for diagnostic skill practice.

## Current State
- **62 unique cases** from 2 validated datasets stored in PostgreSQL
- Normalized database with symptoms catalog and case-symptom relationships
- Each case has presenting symptoms, absent symptoms (for differential diagnosis), and physical exam findings

## Database Schema
```sql
symptoms (id, name, category, severity_weight)
cases (id, case_id, age, gender, chief_complaint, history, duration, severity, triggers, diagnosis, description, difficulty, source)
case_symptoms (id, case_id, symptom_id, symptom_type: presenting/absent/exam_finding)
precautions (id, case_id, precaution)
```

## Data Sources
1. **Kaggle Disease Symptom Dataset** (24 cases)
   - https://www.kaggle.com/datasets/itachi9604/disease-symptom-description-dataset
   - Complete with exam findings and patient denials
   
2. **MedQuAD - Medical Question Answering Dataset** (38 cases)
   - https://www.kaggle.com/datasets/jpmiller/layoutlm
   - Exam findings and denials generated using medical knowledge

## Symptom Categories
- general, pain, respiratory, gi, skin, neuro, musculoskeletal, urinary, cardiovascular, other

## Project Structure
```
├── backend/
│   ├── app.py                  # Flask web viewer (port 5000)
│   └── training_cases.json     # Original JSON (backup)
├── data/                       # Source datasets (gitignored)
└── replit.md
```

## API Endpoints
- `GET /` - Web viewer
- `GET /api/cases` - All cases as JSON
- `GET /api/cases/<id>` - Single case detail

## How to Run
Flask app runs on port 5000 via workflow: `python backend/app.py`

## Next Steps
- Build training app with AI patient simulator
- Add differential diagnosis challenges
