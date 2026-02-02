"""
FastAPI Medical Case Training API
"""

import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from typing import Optional

from models import get_db, engine, Base, Case, Symptom, CaseSymptom
import crud
import schemas

app = FastAPI(
    title="Medical Case Training API",
    description="API for medical student training with GP-level patient cases",
    version="1.0.0"
)

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


@app.get("/", response_class=HTMLResponse)
def read_root(db: Session = Depends(get_db)):
    stats = crud.get_stats(db)
    cases = crud.get_all_cases_detail(db)
    
    cases_html = ""
    for i, c in enumerate(cases, 1):
        symptoms_tags = "".join([f'<span class="symptom-tag">{s}</span>' for s in c['presenting_symptoms'][:3]])
        if len(c['presenting_symptoms']) > 3:
            symptoms_tags += f'<span class="symptom-tag">+{len(c["presenting_symptoms"]) - 3} more</span>'
        
        diff_class = {1: 'Easy', 2: 'Medium', 3: 'Hard'}.get(c['difficulty'], 'Medium')
        
        cases_html += f'''
        <div class="case-card" data-difficulty="{c['difficulty']}" onclick="showCase({i-1})">
            <div class="case-header">
                <span class="case-id">Case #{i} <span class="source-badge">{c['source']}</span></span>
                <span class="badge badge-diff-{c['difficulty']}">{diff_class}</span>
            </div>
            <div class="case-body">
                <div class="patient-info">
                    <span>{c['age']}</span>
                    <span>{c['gender']}</span>
                </div>
                <div class="chief-complaint">"{c['chief_complaint']}"</div>
                <div class="case-meta">
                    <span><strong>Duration:</strong> {c['duration']}</span>
                    <span><strong>Severity:</strong> {c['severity']}</span>
                </div>
                <div class="symptom-list">{symptoms_tags}</div>
            </div>
        </div>
        '''
    
    import json
    from datetime import datetime
    
    def json_serial(obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        raise TypeError(f"Type {type(obj)} not serializable")
    
    cases_json = json.dumps(cases, default=json_serial)
    
    html = f'''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Medical Training Cases</title>
    <style>
        * {{ box-sizing: border-box; margin: 0; padding: 0; }}
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f7fa; color: #333; line-height: 1.6; }}
        .container {{ max-width: 1200px; margin: 0 auto; padding: 20px; }}
        header {{ background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 30px 20px; margin-bottom: 30px; }}
        header h1 {{ font-size: 2em; margin-bottom: 10px; }}
        header p {{ opacity: 0.9; }}
        .stats {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px; margin-bottom: 30px; }}
        .stat-card {{ background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); text-align: center; }}
        .stat-card h3 {{ font-size: 2em; color: #2563eb; }}
        .stat-card p {{ color: #666; font-size: 0.9em; }}
        .filters {{ display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }}
        .filter-btn {{ padding: 8px 16px; border: 2px solid #e5e7eb; background: white; border-radius: 20px; cursor: pointer; font-size: 0.9em; transition: all 0.2s; }}
        .filter-btn:hover {{ border-color: #2563eb; }}
        .filter-btn.active {{ background: #2563eb; color: white; border-color: #2563eb; }}
        .case-grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 20px; }}
        .case-card {{ background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }}
        .case-card:hover {{ transform: translateY(-3px); box-shadow: 0 4px 20px rgba(0,0,0,0.12); }}
        .case-header {{ padding: 15px 20px; background: #f8fafc; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }}
        .case-id {{ font-weight: 600; color: #1e40af; font-size: 0.9em; }}
        .badge {{ display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 0.75em; font-weight: 600; }}
        .badge-diff-1 {{ background: #dcfce7; color: #166534; }}
        .badge-diff-2 {{ background: #fef3c7; color: #92400e; }}
        .badge-diff-3 {{ background: #fee2e2; color: #991b1b; }}
        .case-body {{ padding: 20px; }}
        .patient-info {{ display: flex; gap: 15px; margin-bottom: 12px; font-size: 0.9em; color: #666; }}
        .chief-complaint {{ background: #eff6ff; padding: 12px 15px; border-radius: 8px; font-style: italic; color: #1e40af; margin-bottom: 12px; border-left: 3px solid #2563eb; }}
        .case-meta {{ font-size: 0.85em; color: #666; margin-bottom: 12px; }}
        .case-meta span {{ display: inline-block; margin-right: 15px; }}
        .symptom-list {{ display: flex; flex-wrap: wrap; gap: 6px; }}
        .symptom-tag {{ background: #e0e7ff; color: #3730a3; padding: 3px 8px; border-radius: 12px; font-size: 0.8em; }}
        .symptom-tag.exam {{ background: #fef3c7; color: #92400e; }}
        .symptom-tag.negative {{ background: #fee2e2; color: #991b1b; }}
        .source-badge {{ font-size: 0.7em; padding: 2px 6px; border-radius: 4px; background: #e2e8f0; color: #64748b; margin-left: 8px; }}
        .modal {{ display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; overflow-y: auto; }}
        .modal-content {{ background: white; max-width: 750px; margin: 30px auto; border-radius: 12px; max-height: 95vh; overflow-y: auto; }}
        .modal-header {{ padding: 20px; background: #f8fafc; border-bottom: 1px solid #eee; position: sticky; top: 0; }}
        .modal-header h2 {{ margin-bottom: 10px; color: #1e40af; }}
        .modal-body {{ padding: 20px; }}
        .close-btn {{ position: absolute; top: 15px; right: 20px; font-size: 1.5em; cursor: pointer; color: #666; }}
        .section {{ margin-bottom: 20px; }}
        .section h4 {{ color: #1e40af; margin-bottom: 10px; font-size: 0.95em; }}
        .info-grid {{ display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }}
        .info-item {{ background: #f8fafc; padding: 10px 12px; border-radius: 6px; }}
        .info-item label {{ font-size: 0.75em; color: #666; display: block; }}
        .info-item span {{ font-weight: 500; }}
        .diagnosis-reveal {{ background: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 15px; }}
        .diagnosis-reveal h3 {{ color: #92400e; margin-bottom: 5px; }}
    </style>
</head>
<body>
    <header>
        <div class="container">
            <h1>Medical Training Cases</h1>
            <p>{stats['total_cases']} GP-level patient cases with detailed clinical presentations</p>
        </div>
    </header>
    <div class="container">
        <div class="stats">
            <div class="stat-card"><h3>{stats['total_cases']}</h3><p>Unique Cases</p></div>
            <div class="stat-card"><h3>{stats['easy_count']}</h3><p>Easy</p></div>
            <div class="stat-card"><h3>{stats['medium_count']}</h3><p>Medium</p></div>
            <div class="stat-card"><h3>{stats['hard_count']}</h3><p>Hard</p></div>
        </div>
        <div class="filters">
            <button class="filter-btn active" onclick="filterCases('all')">All</button>
            <button class="filter-btn" onclick="filterCases(1)">Easy</button>
            <button class="filter-btn" onclick="filterCases(2)">Medium</button>
            <button class="filter-btn" onclick="filterCases(3)">Hard</button>
        </div>
        <div class="case-grid" id="caseGrid">{cases_html}</div>
    </div>
    <div class="modal" id="modal">
        <div class="modal-content">
            <div class="modal-header">
                <span class="close-btn" onclick="closeModal()">&times;</span>
                <h2 id="modal-title"></h2>
                <div id="modal-badge"></div>
            </div>
            <div class="modal-body" id="modal-body"></div>
        </div>
    </div>
    <script>
        const cases = {cases_json};
        function filterCases(difficulty) {{
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            document.querySelectorAll('.case-card').forEach(card => {{
                if (difficulty === 'all' || card.dataset.difficulty == difficulty) {{
                    card.style.display = 'block';
                }} else {{
                    card.style.display = 'none';
                }}
            }});
        }}
        function showCase(index) {{
            const c = cases[index];
            document.getElementById('modal-title').textContent = `Case #${{index + 1}}: ${{c.age}} ${{c.gender}}`;
            const diffText = c.difficulty === 1 ? 'Easy' : (c.difficulty === 2 ? 'Medium' : 'Hard');
            document.getElementById('modal-badge').innerHTML = `<span class="badge badge-diff-${{c.difficulty}}">${{diffText}}</span>`;
            let reportedHtml = '<div class="symptom-list">' + c.presenting_symptoms.map(s => `<span class="symptom-tag">${{s}}</span>`).join('') + '</div>';
            let examHtml = '<div class="symptom-list">' + c.exam_findings.map(s => `<span class="symptom-tag exam">${{s}}</span>`).join('') + '</div>';
            let negativeHtml = '<div class="symptom-list">' + c.absent_symptoms.map(s => `<span class="symptom-tag negative">${{s}}</span>`).join('') + '</div>';
            document.getElementById('modal-body').innerHTML = `
                <div class="section"><h4>Chief Complaint</h4><div class="chief-complaint">"${{c.chief_complaint}}"</div></div>
                <div class="section"><h4>History</h4><p>${{c.history}}</p></div>
                <div class="section"><div class="info-grid">
                    <div class="info-item"><label>Duration</label><span>${{c.duration}}</span></div>
                    <div class="info-item"><label>Severity</label><span>${{c.severity}}</span></div>
                    <div class="info-item" style="grid-column: span 2"><label>Triggers</label><span>${{c.triggers}}</span></div>
                </div></div>
                <div class="section"><h4>Presenting Symptoms</h4>${{reportedHtml}}</div>
                <div class="section"><h4>Physical Exam Findings</h4>${{examHtml}}</div>
                <div class="section"><h4>Patient Denies</h4>${{negativeHtml}}</div>
                <div class="diagnosis-reveal"><h3>Diagnosis: ${{c.diagnosis}}</h3><p style="margin-top:10px; font-size:0.9em; color:#666;">${{c.description}}</p></div>
            `;
            document.getElementById('modal').style.display = 'block';
        }}
        function closeModal() {{ document.getElementById('modal').style.display = 'none'; }}
        window.onclick = function(event) {{ const modal = document.getElementById('modal'); if (event.target === modal) modal.style.display = 'none'; }}
    </script>
</body>
</html>
'''
    return HTMLResponse(content=html)


@app.get("/api/stats", response_model=schemas.StatsResponse)
def get_stats(db: Session = Depends(get_db)):
    return crud.get_stats(db)


@app.get("/api/cases", response_model=schemas.CaseListResponse)
def get_cases(
    difficulty: Optional[int] = Query(None, ge=1, le=3),
    db: Session = Depends(get_db)
):
    cases = crud.get_all_cases_detail(db, difficulty=difficulty)
    return {"total": len(cases), "cases": cases}


@app.get("/api/cases/{case_id}", response_model=schemas.CaseDetailResponse)
def get_case(case_id: int, db: Session = Depends(get_db)):
    case = crud.get_case_detail(db, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case


@app.post("/api/cases", response_model=schemas.CaseResponse)
def create_case(case: schemas.CaseCreate, db: Session = Depends(get_db)):
    existing = crud.get_case_by_case_id(db, case.case_id)
    if existing:
        raise HTTPException(status_code=400, detail="Case with this case_id already exists")
    return crud.create_case(db, case)


@app.put("/api/cases/{case_id}", response_model=schemas.CaseResponse)
def update_case(case_id: int, case_update: schemas.CaseUpdate, db: Session = Depends(get_db)):
    updated = crud.update_case(db, case_id, case_update)
    if not updated:
        raise HTTPException(status_code=404, detail="Case not found")
    return updated


@app.delete("/api/cases/{case_id}")
def delete_case(case_id: int, db: Session = Depends(get_db)):
    if not crud.delete_case(db, case_id):
        raise HTTPException(status_code=404, detail="Case not found")
    return {"message": "Case deleted successfully"}


@app.get("/api/symptoms", response_model=list[schemas.SymptomResponse])
def get_symptoms(
    category: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return crud.get_symptoms(db, category=category, skip=skip, limit=limit)


@app.get("/api/symptoms/{symptom_id}", response_model=schemas.SymptomResponse)
def get_symptom(symptom_id: int, db: Session = Depends(get_db)):
    symptom = crud.get_symptom(db, symptom_id)
    if not symptom:
        raise HTTPException(status_code=404, detail="Symptom not found")
    return symptom


@app.post("/api/symptoms", response_model=schemas.SymptomResponse)
def create_symptom(symptom: schemas.SymptomCreate, db: Session = Depends(get_db)):
    existing = crud.get_symptom_by_name(db, symptom.name)
    if existing:
        raise HTTPException(status_code=400, detail="Symptom already exists")
    return crud.create_symptom(db, symptom)


@app.delete("/api/symptoms/{symptom_id}")
def delete_symptom(symptom_id: int, db: Session = Depends(get_db)):
    if not crud.delete_symptom(db, symptom_id):
        raise HTTPException(status_code=404, detail="Symptom not found")
    return {"message": "Symptom deleted successfully"}


@app.post("/api/cases/{case_id}/symptoms")
def add_symptom_to_case(
    case_id: int,
    symptom_data: schemas.CaseSymptomCreate,
    db: Session = Depends(get_db)
):
    case = crud.get_case(db, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    symptom = crud.get_symptom(db, symptom_data.symptom_id)
    if not symptom:
        raise HTTPException(status_code=404, detail="Symptom not found")
    
    return crud.add_case_symptom(db, case_id, symptom_data.symptom_id, symptom_data.symptom_type)


@app.delete("/api/cases/{case_id}/symptoms/{case_symptom_id}")
def remove_symptom_from_case(case_id: int, case_symptom_id: int, db: Session = Depends(get_db)):
    if not crud.remove_case_symptom(db, case_symptom_id):
        raise HTTPException(status_code=404, detail="Case symptom not found")
    return {"message": "Symptom removed from case"}


@app.get("/api/search/symptom/{symptom_name}")
def search_by_symptom(symptom_name: str, db: Session = Depends(get_db)):
    cases = crud.search_cases_by_symptom(db, symptom_name)
    return {"total": len(cases), "cases": cases}


@app.get("/api/search/diagnosis/{diagnosis}")
def search_by_diagnosis(diagnosis: str, db: Session = Depends(get_db)):
    cases = crud.search_cases_by_diagnosis(db, diagnosis)
    return {"total": len(cases), "cases": cases}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
