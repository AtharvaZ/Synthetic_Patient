# Medical Case Viewer - GP Training Dataset

## Overview
Medical student training application with GP-level patient cases for diagnostic skill practice.

## Current State
- **62 unique cases** from 2 validated datasets
- Each case has symptoms, history, exam findings, diagnosis
- Difficulty levels: Easy (5), Medium (47), Hard (10)

## Data Sources
1. **Kaggle Disease Symptom Dataset** (24 cases)
   - https://www.kaggle.com/datasets/itachi9604/disease-symptom-description-dataset
   - Structured symptoms with severity weights
   
2. **MedQuAD - Medical Question Answering Dataset** (38 cases)
   - https://www.kaggle.com/datasets/jpmiller/layoutlm
   - Q&A format with symptom descriptions, causes, treatments

## Project Structure
```
├── backend/
│   ├── app.py                  # Flask web viewer (port 5000)
│   └── training_cases.json     # 62 merged cases
├── data/                       # Source datasets (gitignored)
└── replit.md
```

## How to Run
Flask app runs on port 5000 via workflow: `python backend/app.py`

## Next Steps
- Build training app with AI patient simulator
- Add differential diagnosis challenges
