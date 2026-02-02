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

## Case Structure
```json
{
  "case_id": "common_cold",
  "patient": {"age": 28, "gender": "Female"},
  "presentation": {
    "chief_complaint": "I've had a stuffy nose...",
    "history": "Started with scratchy throat...",
    "duration": "3 days",
    "severity": "mild to moderate",
    "triggers": "possibly exposure at work"
  },
  "symptoms": {
    "reported": ["runny nose", "sore throat"],
    "negative": ["no fever", "no chest pain"],
    "exam_findings": ["nasal congestion"]
  },
  "diagnosis": "Common Cold",
  "description": "...",
  "precautions": ["..."]
}
```

## Conditions Covered
### From Kaggle (24)
Common Cold, Fungal infection, Allergy, GERD, Gastroenteritis, Migraine, Vertigo, Acne, UTI, Impetigo, Hypoglycemia, Bronchial Asthma, Pneumonia, Peptic ulcer, Chicken pox, Dengue, Typhoid, Malaria, Psoriasis, Drug Reaction, Hypertension, Hypothyroidism, Hyperthyroidism, Arthritis, Osteoarthritis

### From MedQuAD (38)
Urinary Tract Infections, Bronchitis, Viral Gastroenteritis, Asthma, Indigestion, Diarrhea, Cough, Insomnia, High Blood Pressure, Anemia, Iron-Deficiency Anemia, Gout, Shingles, Rheumatoid Arthritis, Anxiety Disorders, Back Pain, BPPV, Cold Sores, Constipation, Depression, Ear Infections, Eczema, Flu, Headache, Heartburn, Hives, Hay Fever, Nausea/Vomiting, Scabies, Sinusitis, Sore Throat, Sprains/Strains, Streptococcal Infections, Tendinitis, Warts, Yeast Infections, Atopic Dermatitis, Rashes

## Project Structure
```
├── app.py                      # Flask web viewer (port 5000)
├── training_cases.json         # 62 merged cases
├── curated_medical_cases.json  # Original Kaggle cases
├── medquad_cases.json          # MedQuAD extracted cases
├── data/                       # Source datasets
│   ├── dataset.csv
│   ├── Symptom-severity.csv
│   ├── symptom_Description.csv
│   ├── symptom_precaution.csv
│   └── medquad_data/
│       └── medquad.csv
└── replit.md
```

## How to Run
Flask app runs on port 5000 via workflow.

## Next Steps
- Build training app with AI patient simulator
- Add differential diagnosis challenges (similar symptoms, different diagnoses)
