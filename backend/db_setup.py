"""
Database Setup Script
Creates PostgreSQL tables and loads medical case data
"""

import os
import psycopg2

def create_tables():
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    cur.execute("""
        CREATE TABLE IF NOT EXISTS symptoms (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            category VARCHAR(50),
            severity_weight INTEGER DEFAULT 3
        );

        CREATE TABLE IF NOT EXISTS cases (
            id SERIAL PRIMARY KEY,
            case_id VARCHAR(100) NOT NULL UNIQUE,
            age VARCHAR(30),
            gender VARCHAR(20),
            chief_complaint TEXT,
            history TEXT,
            duration VARCHAR(50),
            severity VARCHAR(50),
            triggers TEXT,
            diagnosis VARCHAR(200) NOT NULL,
            description TEXT,
            difficulty INTEGER DEFAULT 2,
            source VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS case_symptoms (
            id SERIAL PRIMARY KEY,
            case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
            symptom_id INTEGER REFERENCES symptoms(id) ON DELETE CASCADE,
            symptom_type VARCHAR(20) NOT NULL CHECK (symptom_type IN ('presenting', 'absent', 'exam_finding')),
            UNIQUE(case_id, symptom_id, symptom_type)
        );

        CREATE TABLE IF NOT EXISTS precautions (
            id SERIAL PRIMARY KEY,
            case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
            precaution TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_case_symptoms_case ON case_symptoms(case_id);
        CREATE INDEX IF NOT EXISTS idx_case_symptoms_symptom ON case_symptoms(symptom_id);
        CREATE INDEX IF NOT EXISTS idx_symptoms_category ON symptoms(category);
    """)
    
    conn.commit()
    cur.close()
    conn.close()
    print("Tables created successfully")

def check_data():
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    cur.execute("SELECT COUNT(*) FROM cases")
    result = cur.fetchone()
    cases = result[0] if result else 0
    
    cur.execute("SELECT COUNT(*) FROM symptoms")
    result = cur.fetchone()
    symptoms = result[0] if result else 0
    
    cur.execute("SELECT symptom_type, COUNT(*) FROM case_symptoms GROUP BY symptom_type")
    symptom_types = dict(cur.fetchall())
    
    cur.close()
    conn.close()
    
    print(f"Cases: {cases}")
    print(f"Symptoms: {symptoms}")
    print(f"Symptom links: {symptom_types}")
    
    return cases, symptoms

if __name__ == '__main__':
    create_tables()
    check_data()
