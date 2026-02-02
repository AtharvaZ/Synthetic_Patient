"""
Medical Case Viewer - Flask App
Browse GP-level patient cases for medical student training
"""

from flask import Flask, render_template_string, jsonify
import json

app = Flask(__name__)

def load_cases():
    with open('training_cases.json', 'r', encoding='utf-8') as f:
        return json.load(f)

HTML_TEMPLATE = '''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Medical Training Cases</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f7fa;
            color: #333;
            line-height: 1.6;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        header {
            background: linear-gradient(135deg, #2563eb, #1d4ed8);
            color: white;
            padding: 30px 20px;
            margin-bottom: 30px;
        }
        header h1 { font-size: 2em; margin-bottom: 10px; }
        header p { opacity: 0.9; }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            text-align: center;
        }
        .stat-card h3 { font-size: 2em; color: #2563eb; }
        .stat-card p { color: #666; font-size: 0.9em; }
        .filters {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }
        .filter-btn {
            padding: 8px 16px;
            border: 2px solid #e5e7eb;
            background: white;
            border-radius: 20px;
            cursor: pointer;
            font-size: 0.9em;
            transition: all 0.2s;
        }
        .filter-btn:hover { border-color: #2563eb; }
        .filter-btn.active { background: #2563eb; color: white; border-color: #2563eb; }
        .case-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
            gap: 20px;
        }
        .case-card {
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            overflow: hidden;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .case-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 4px 20px rgba(0,0,0,0.12);
        }
        .case-header {
            padding: 15px 20px;
            background: #f8fafc;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .case-id { font-weight: 600; color: #1e40af; font-size: 0.9em; }
        .badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 0.75em;
            font-weight: 600;
        }
        .badge-diff-1 { background: #dcfce7; color: #166534; }
        .badge-diff-2 { background: #fef3c7; color: #92400e; }
        .badge-diff-3 { background: #fee2e2; color: #991b1b; }
        .case-body { padding: 20px; }
        .patient-info {
            display: flex;
            gap: 15px;
            margin-bottom: 12px;
            font-size: 0.9em;
            color: #666;
        }
        .chief-complaint {
            background: #eff6ff;
            padding: 12px 15px;
            border-radius: 8px;
            font-style: italic;
            color: #1e40af;
            margin-bottom: 12px;
            border-left: 3px solid #2563eb;
        }
        .case-meta {
            font-size: 0.85em;
            color: #666;
            margin-bottom: 12px;
        }
        .case-meta span {
            display: inline-block;
            margin-right: 15px;
        }
        .symptom-list {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
        }
        .symptom-tag {
            background: #e0e7ff;
            color: #3730a3;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 0.8em;
        }
        .symptom-tag.exam { background: #fef3c7; color: #92400e; }
        .symptom-tag.negative { background: #fee2e2; color: #991b1b; }
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 1000;
            overflow-y: auto;
        }
        .modal-content {
            background: white;
            max-width: 750px;
            margin: 30px auto;
            border-radius: 12px;
            max-height: 95vh;
            overflow-y: auto;
        }
        .modal-header {
            padding: 20px;
            background: #f8fafc;
            border-bottom: 1px solid #eee;
            position: sticky;
            top: 0;
        }
        .modal-header h2 { margin-bottom: 10px; color: #1e40af; }
        .modal-body { padding: 20px; }
        .close-btn {
            position: absolute;
            top: 15px;
            right: 20px;
            font-size: 1.5em;
            cursor: pointer;
            color: #666;
        }
        .section { margin-bottom: 20px; }
        .section h4 { color: #1e40af; margin-bottom: 10px; font-size: 0.95em; }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
        }
        .info-item {
            background: #f8fafc;
            padding: 10px 12px;
            border-radius: 6px;
        }
        .info-item label { font-size: 0.75em; color: #666; display: block; }
        .info-item span { font-weight: 500; }
        .diagnosis-reveal {
            background: #fef3c7;
            padding: 15px;
            border-radius: 8px;
            margin-top: 15px;
        }
        .diagnosis-reveal h3 { color: #92400e; margin-bottom: 5px; }
        .precaution-list { list-style: none; }
        .precaution-list li {
            padding: 8px 12px;
            background: #f0fdf4;
            margin-bottom: 5px;
            border-radius: 6px;
            border-left: 3px solid #22c55e;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <h1>Medical Training Cases</h1>
            <p>24 unique GP-level patient cases with detailed clinical presentations</p>
        </div>
    </header>

    <div class="container">
        <div class="stats">
            <div class="stat-card">
                <h3>{{ data.metadata.total_cases }}</h3>
                <p>Unique Cases</p>
            </div>
            <div class="stat-card">
                <h3>{{ diff_counts[1] }}</h3>
                <p>Easy</p>
            </div>
            <div class="stat-card">
                <h3>{{ diff_counts[2] }}</h3>
                <p>Medium</p>
            </div>
            <div class="stat-card">
                <h3>{{ diff_counts[3] }}</h3>
                <p>Hard</p>
            </div>
        </div>

        <div class="filters">
            <button class="filter-btn active" onclick="filterCases('all')">All</button>
            <button class="filter-btn" onclick="filterCases(1)">Easy</button>
            <button class="filter-btn" onclick="filterCases(2)">Medium</button>
            <button class="filter-btn" onclick="filterCases(3)">Hard</button>
        </div>

        <div class="case-grid" id="caseGrid">
            {% for case in data.cases %}
            <div class="case-card" data-difficulty="{{ case.difficulty }}" onclick="showCase({{ loop.index0 }})">
                <div class="case-header">
                    <span class="case-id">Case #{{ loop.index }}</span>
                    <span class="badge badge-diff-{{ case.difficulty }}">
                        {% if case.difficulty == 1 %}Easy{% elif case.difficulty == 2 %}Medium{% else %}Hard{% endif %}
                    </span>
                </div>
                <div class="case-body">
                    <div class="patient-info">
                        <span>{{ case.patient.age }} years old</span>
                        <span>{{ case.patient.gender }}</span>
                    </div>
                    <div class="chief-complaint">"{{ case.presentation.chief_complaint }}"</div>
                    <div class="case-meta">
                        <span><strong>Duration:</strong> {{ case.presentation.duration }}</span>
                        <span><strong>Severity:</strong> {{ case.presentation.severity }}</span>
                    </div>
                    <div class="symptom-list">
                        {% for s in case.symptoms.reported[:3] %}
                        <span class="symptom-tag">{{ s }}</span>
                        {% endfor %}
                        {% if case.symptoms.reported|length > 3 %}
                        <span class="symptom-tag">+{{ case.symptoms.reported|length - 3 }} more</span>
                        {% endif %}
                    </div>
                </div>
            </div>
            {% endfor %}
        </div>
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
        const cases = {{ data.cases | tojson }};
        
        function filterCases(difficulty) {
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            
            document.querySelectorAll('.case-card').forEach(card => {
                if (difficulty === 'all' || card.dataset.difficulty == difficulty) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        }
        
        function showCase(index) {
            const c = cases[index];
            document.getElementById('modal-title').textContent = `Case #${index + 1}: ${c.patient.age}yo ${c.patient.gender}`;
            
            const diffText = c.difficulty === 1 ? 'Easy' : (c.difficulty === 2 ? 'Medium' : 'Hard');
            document.getElementById('modal-badge').innerHTML = 
                `<span class="badge badge-diff-${c.difficulty}">${diffText}</span>`;
            
            let reportedHtml = '<div class="symptom-list">';
            c.symptoms.reported.forEach(s => {
                reportedHtml += `<span class="symptom-tag">${s}</span>`;
            });
            reportedHtml += '</div>';
            
            let examHtml = '<div class="symptom-list">';
            c.symptoms.exam_findings.forEach(s => {
                examHtml += `<span class="symptom-tag exam">${s}</span>`;
            });
            examHtml += '</div>';
            
            let negativeHtml = '<div class="symptom-list">';
            c.symptoms.negative.forEach(s => {
                negativeHtml += `<span class="symptom-tag negative">${s}</span>`;
            });
            negativeHtml += '</div>';
            
            let precautionsHtml = '<ul class="precaution-list">';
            c.precautions.forEach(p => {
                precautionsHtml += `<li>${p}</li>`;
            });
            precautionsHtml += '</ul>';
            
            document.getElementById('modal-body').innerHTML = `
                <div class="section">
                    <h4>Chief Complaint</h4>
                    <div class="chief-complaint">"${c.presentation.chief_complaint}"</div>
                </div>
                <div class="section">
                    <h4>History</h4>
                    <p>${c.presentation.history}</p>
                </div>
                <div class="section">
                    <div class="info-grid">
                        <div class="info-item"><label>Duration</label><span>${c.presentation.duration}</span></div>
                        <div class="info-item"><label>Severity</label><span>${c.presentation.severity}</span></div>
                        <div class="info-item" style="grid-column: span 2"><label>Triggers</label><span>${c.presentation.triggers}</span></div>
                    </div>
                </div>
                <div class="section">
                    <h4>Reported Symptoms</h4>
                    ${reportedHtml}
                </div>
                <div class="section">
                    <h4>Physical Exam Findings</h4>
                    ${examHtml}
                </div>
                <div class="section">
                    <h4>Negative Symptoms (patient denies)</h4>
                    ${negativeHtml}
                </div>
                <div class="diagnosis-reveal">
                    <h3>Diagnosis: ${c.diagnosis}</h3>
                    <p style="margin-top:10px; font-size:0.9em; color:#666;">${c.description}</p>
                </div>
                <div class="section" style="margin-top:20px;">
                    <h4>Precautions</h4>
                    ${precautionsHtml}
                </div>
            `;
            
            document.getElementById('modal').style.display = 'block';
        }
        
        function closeModal() {
            document.getElementById('modal').style.display = 'none';
        }
        
        window.onclick = function(event) {
            const modal = document.getElementById('modal');
            if (event.target === modal) modal.style.display = 'none';
        }
    </script>
</body>
</html>
'''

@app.route('/')
def index():
    data = load_cases()
    
    diff_counts = {1: 0, 2: 0, 3: 0}
    for case in data['cases']:
        diff_counts[case['difficulty']] = diff_counts.get(case['difficulty'], 0) + 1
    
    return render_template_string(HTML_TEMPLATE, data=data, diff_counts=diff_counts)

@app.route('/api/cases')
def api_cases():
    return jsonify(load_cases())

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
