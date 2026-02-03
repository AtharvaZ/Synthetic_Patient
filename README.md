# ClinIQ - Medical Diagnostic Training Platform

Practice clinical diagnosis through interactive AI-simulated patient conversations.

## What is ClinIQ?

ClinIQ is a medical education platform designed for medical students to practice diagnostic skills in a safe, risk-free environment. Instead of waiting for clinical rotations, students can interview AI-powered virtual patients based on real clinical cases.

### How It Works

1. **Choose a Case** - Select from 62 validated GP-level clinical scenarios across different difficulty levels
2. **Interview the Patient** - Ask questions just like you would in a real consultation
3. **Get Progressive Hints** - Stuck? Request hints that guide your thinking without giving away the answer
4. **Submit Your Diagnosis** - Make your diagnostic decision when ready
5. **Receive Feedback** - Get detailed AI-generated feedback on your diagnostic reasoning

### Key Features

- **Realistic Patient Simulations** - AI patients respond naturally, reveal symptoms gradually, and behave like real patients
- **62 Validated Cases** - Covering 12 medical specialties including Cardiology, Respiratory, Neurology, GI, Dermatology, and more
- **Progressive Hint System** - Guided hints help develop systematic diagnostic reasoning
- **Personalized Feedback** - AI-generated insights on what you did well and what you missed
- **Progress Tracking** - Track your completed cases, accuracy, and learning streaks
- **Dark/Light Theme** - Comfortable learning experience in any environment

## Local Development Setup

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+ (3.11 recommended)
- **PostgreSQL** 14+ (for storing clinical cases)

### Step 1: Clone and Install

```bash
git clone <repository-url>
cd ClinIQ

# Install frontend dependencies (from project root)
npm install

# Set up Python backend environment
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### Step 2: Set Up Database

The database stores the 62 validated clinical cases. User progress is saved in your browser's localStorage.

```bash
# Create PostgreSQL database
createdb cliniq
```

### Step 3: Configure Environment

Create `backend/.env`:

```bash
# Required - PostgreSQL connection (replace 'your_username' with your system username)
DATABASE_URL=postgresql://your_username@localhost:5432/cliniq

# Optional - For AI patient conversations (without this, basic fallback responses are used)
ANTHROPIC_API_KEY=your_api_key_here
```

### Step 4: Seed the Database

This loads the 62 clinical cases into your database:

```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python seed_data.py
cd ..
```

### Step 5: Run the Application

Open **two terminal windows**:

**Terminal 1 - Backend API (Port 8000):**
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python main.py
```

**Terminal 2 - Frontend (Port 5000):**
```bash
# From project root
npm run dev
```

### Step 6: Open in Browser

- **App**: http://localhost:5000
- **API Docs**: http://localhost:8000/docs

### Troubleshooting

- **Database connection errors**: Make sure PostgreSQL is running and your username in `DATABASE_URL` matches your system user
- **Port already in use**: Kill any existing processes on ports 5000 or 8000
- **AI not responding**: Check that `ANTHROPIC_API_KEY` is set correctly (optional - app works without it)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, TypeScript, Tailwind CSS, Framer Motion |
| Backend | FastAPI, SQLAlchemy, Python |
| AI | Claude AI (Anthropic) |
| Database | PostgreSQL |

## Data Sources

ClinIQ's 62 clinical cases are derived from validated medical datasets and references:

### Kaggle Datasets
- **[Disease Symptom Dataset](https://www.kaggle.com/datasets/itachi9604/disease-symptom-knowledge-database)** - Comprehensive symptom-disease mappings
- **[MedQuAD](https://www.kaggle.com/datasets/pythonafraea/medquad-medical-question-answer-pairs)** - Medical Question Answering Dataset with clinical Q&A pairs

### Medical References
- Mayo Clinic
- NHS (National Health Service)
- MedlinePlus

All case data is licensed under CC BY-SA 4.0.

## License

This project is for educational purposes. See LICENSE for details.
