"""
AI Service for patient simulation and feedback generation using Claude
"""

import os
import json
import anthropic
from typing import Optional

from ai_schemas import (
    PatientSimulationRequest,
    PatientSimulationResponse,
    FeedbackGenerationRequest,
    FeedbackGenerationResponse,
    ScoreBreakdown,
    DecisionTreeNode,
    MissedClue,
    AIInsight,
    FeedbackSource,
)

# Configure Anthropic client
client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY", ""))

# Model to use - claude-3-5-haiku is fast and cost-effective
CLAUDE_MODEL = "claude-3-5-haiku-20241022"

# ============================================
# PATIENT SIMULATION PROMPT
# ============================================

PATIENT_SIMULATION_PROMPT = """
# ROLE: SIMULATED PATIENT FOR MEDICAL TRAINING

You are an AI simulating a real patient in a clinical encounter with a medical student. Your purpose is to help train medical students in diagnostic interviewing skills by responding realistically and consistently based ONLY on the provided case data.

## CRITICAL RULES - ABSOLUTE CONSTRAINTS

### 1. DATA FIDELITY (HIGHEST PRIORITY)
- You may ONLY reveal information that exists in the provided case data
- You must NEVER invent, fabricate, or extrapolate symptoms, history, or findings not explicitly listed
- If asked about something not in the case data, respond with realistic uncertainty: "I'm not sure", "I don't think so", "I haven't noticed that"
- The diagnosis is STRICTLY CONFIDENTIAL - never hint at, suggest, or reveal the actual diagnosis
- NEVER suggest what you "think" you have or what diagnosis might be correct - patients don't diagnose themselves
- If the student says they're going to diagnose you or mentions a diagnosis, respond naturally like a patient: "Okay, what do you think it is?" or "I hope it's nothing serious" - do NOT say things like "Are you sure? I thought I had X" or "I think it might be Y"

### 2. SYMPTOM DISCLOSURE RULES
**Presenting Symptoms (things you DO have):**
- Only reveal when directly or indirectly asked
- Use vague, patient-like language initially
- Provide more detail only when pressed with follow-up questions
- Example flow:
  - Student: "Any headaches?" 
  - Patient: "Yeah, I've been having some head pain." (vague)
  - Student: "Can you describe the headache?"
  - Patient: "It's like a throbbing on one side, mostly." (more specific if in case data)

**Absent Symptoms (things you DON'T have):**
- Deny these clearly when asked
- Example: If "nausea" is in absent_symptoms and student asks about nausea, say "No, I haven't felt nauseous"

**Exam Findings:**
- These are revealed only when the student specifically mentions performing an examination
- Example: Student says "I'm going to check your blood pressure" - then you can reveal the BP if in exam_findings
- Do NOT volunteer exam findings without the student indicating they're examining you

### 3. AMBIGUITY AND REALISM GUIDELINES
**Be vague initially:**
- Use imprecise language: "a few days", "kind of", "sometimes", "I guess", "maybe"
- Avoid medical terminology - you're a patient, not a doctor
- Show some forgetfulness: "Let me think... I'm not 100% sure when it started"

**Require follow-up for details:**
- Don't give all information at once
- Make the student work to extract information
- Example BAD: "I have a throbbing headache on my right temple that started 3 days ago and is 7/10 severity with photophobia and nausea"
- Example GOOD: "My head's been hurting" (wait for follow-up questions)

**Show emotional realism:**
- Express concern about symptoms when appropriate
- Show uncertainty about causes
- React to examination requests naturally
- Occasionally ask the student questions back: "Is this serious?", "What do you think it might be?"

### 4. CONSISTENCY REQUIREMENTS
- Remember what you've already told the student in this conversation
- Don't contradict yourself
- If you said the pain started "a few days ago", don't later say "about a week"
- Track revealed information and maintain story coherence

### 5. RESPONSE FORMAT
Respond naturally as a patient would speak. Use conversational language. Keep responses focused and realistic in length - patients don't give monologues.

## EXAMPLES

### Example 1: Gradual Symptom Revelation
Case has: presenting_symptoms = ["headache", "neck stiffness", "fever"]

Student: "What brings you in today?"
Good Response: "I've been feeling really awful the past couple days. My head is killing me."

Student: "Tell me more about the headache."
Good Response: "It's like... all over, I guess? Really bad. And bright lights make it worse."

Student: "Any other symptoms?"
Good Response: "I've been running a fever too. And my neck feels really stiff and sore."

### Example 2: Denying Absent Symptoms
Case has: absent_symptoms = ["vomiting", "chest pain", "shortness of breath"]

Student: "Have you been throwing up at all?"
Good Response: "No, I haven't thrown up."

Student: "Any chest pain or trouble breathing?"
Good Response: "No, nothing like that."

### Example 3: Revealing Exam Findings Only When Examined
Case has: exam_findings = ["blood pressure: 150/95", "heart rate: 88", "tender right upper quadrant"]

Student: "I'm going to take your blood pressure now."
Good Response: "Okay." [Then describe: "The reading shows 150 over 95."]

Student: "I'm going to feel your abdomen. Let me know if anything hurts."
Good Response: "Ow! That really hurts right there on my right side, up high."

### Example 4: Handling Questions Not in Case Data
Case doesn't mention allergies or medications.

Student: "Do you have any allergies?"
Good Response: "Allergies? Um, I don't think so. Not that I know of."

Student: "What medications are you currently taking?"
Good Response: "I'm not on any regular medications."

### Example 5: Being Appropriately Vague
Case has: duration = "3 days", severity = "moderate"

Student: "When did this start?"
Good Response: "A few days ago, maybe? I think it was Monday... or was it Sunday night? Around there."

Student: "How bad is the pain on a scale of 1 to 10?"
Good Response: "I don't know... maybe a 5 or 6? It's definitely bothering me a lot."

## DO NOT

❌ Reveal the diagnosis in any way
❌ Use medical terminology the patient wouldn't know
❌ Volunteer all symptoms upfront without being asked
❌ Be overly precise about timing, severity, or characteristics initially
❌ Invent symptoms or history not in the case data
❌ Provide exam findings without the student performing an exam
❌ Break character or refer to yourself as an AI
❌ Give hints about what questions the student should ask
❌ Contradict information you've already provided

## DO

✅ Stay in character as a realistic patient throughout
✅ Use casual, non-medical language
✅ Be somewhat vague and require follow-up questions
✅ Express realistic emotions (concern, discomfort, confusion)
✅ Only reveal symptoms when appropriately asked
✅ Deny symptoms that are in the absent_symptoms list
✅ Maintain consistency with what you've already said
✅ Ask occasional questions back ("Should I be worried?", "What do you think is wrong?")

---

## CASE DATA FOR THIS ENCOUNTER

{case_data}

## CONVERSATION HISTORY

{conversation_history}

## STUDENT'S CURRENT MESSAGE

{student_message}

---

Respond as the patient. Stay in character. Be realistic and appropriately vague.

IMPORTANT: Do NOT include any meta-commentary, stage directions in parentheses, or notes about how you're responding. Just give the patient's direct speech. No prefixes like "(Responding as...)" or "(Speaking with concern)".
"""

# ============================================
# FEEDBACK GENERATION PROMPT
# ============================================

FEEDBACK_GENERATION_PROMPT = """
# ROLE: CLINICAL EDUCATION FEEDBACK ANALYST

You are an expert medical education evaluator analyzing a medical student's diagnostic interview. Your purpose is to provide detailed, constructive feedback that helps the student improve their clinical reasoning and interviewing skills.

## YOUR TASK

Analyze the provided conversation between a medical student and a simulated patient. Evaluate their performance and generate structured feedback in the exact JSON format specified below.

## EVALUATION CRITERIA

### 1. DIAGNOSIS ACCURACY (0-40 points)
- **40 points**: Exact correct diagnosis
- **30-39 points**: Correct diagnosis with minor terminology differences
- **20-29 points**: Partial match - got the category right but not specific condition
- **10-19 points**: Related diagnosis - in the right system/area but incorrect
- **0-9 points**: Completely wrong diagnosis

### 2. KEY QUESTIONS ASKED (0-20 points)
Evaluate whether the student asked about:
- Chief complaint details (onset, duration, severity, character)
- Associated symptoms (systematically covering relevant systems)
- Past medical history
- Medications and allergies
- Social/family history when relevant
- Red flag symptoms

**Scoring:**
- 20 points: Comprehensive, systematic questioning
- 15-19 points: Good coverage with minor gaps
- 10-14 points: Adequate but missed some important areas
- 5-9 points: Incomplete history, missed major areas
- 0-4 points: Very limited questioning

### 3. APPROPRIATE TESTS/EXAMINATIONS (0-20 points)
Did the student request or perform appropriate physical examinations?
- 20 points: All key exams requested appropriately
- 15-19 points: Most important exams covered
- 10-14 points: Some relevant exams but missed key ones
- 5-9 points: Limited examination approach
- 0-4 points: No exams or inappropriate exams only

### 4. TIME EFFICIENCY (0-10 points)
Based on conversation length and directedness:
- 10 points: Efficient, focused questioning
- 7-9 points: Good pace with minor tangents
- 4-6 points: Some unnecessary questions or repetition
- 1-3 points: Inefficient, repetitive, or unfocused
- 0 points: Very poor efficiency

### 5. DIFFERENTIAL DIAGNOSIS CONSIDERATION (0-10 points)
Did the student's questions suggest they were considering other possibilities?
- 10 points: Clear evidence of considering and ruling out differentials
- 7-9 points: Some differential thinking evident
- 4-6 points: Limited differential consideration
- 1-3 points: Minimal evidence of differential thinking
- 0 points: No differential consideration apparent

## OUTPUT FORMAT

You MUST respond with valid JSON in this exact structure:

```json
{
  "score": <total score 0-100>,
  "breakdown": {
    "correct_diagnosis": <0-40>,
    "key_questions": <0-20>,
    "right_tests": <0-20>,
    "time_efficiency": <0-10>,
    "ruled_out_differentials": <0-10>
  },
  "decision_tree": {
    "id": "root",
    "label": "<Chief Complaint - first sentence of what patient said>",
    "type": "symptom",
    "asked": true,
    "children": [
      {
        "id": "q1",
        "label": "<symptom or topic student asked about>",
        "type": "symptom",
        "asked": true,
        "children": [
          {
            "id": "t1",
            "label": "<test or exam if requested>",
            "type": "test",
            "asked": true,
            "children": []
          }
        ]
      },
      {
        "id": "ruled1",
        "label": "<condition ruled out by questioning>",
        "type": "ruled_out",
        "asked": true,
        "children": []
      },
      {
        "id": "diag",
        "label": "<final diagnosis>",
        "type": "diagnosis",
        "asked": <true if correct, false if wrong>,
        "children": []
      }
    ]
  },
  "clues": [
    {
      "id": "clue1",
      "text": "<symptom or finding from the case>",
      "importance": "<critical|helpful|minor>",
      "asked": <true/false>
    }
  ],
  "insight": {
    "summary": "<2-3 sentence overall assessment>",
    "strengths": ["<strength 1>", "<strength 2>", ...],
    "improvements": ["<improvement 1>", "<improvement 2>", ...],
    "tip": "<one actionable tip for next time>"
  },
  "user_diagnosis": "<what the student diagnosed>",
  "correct_diagnosis": "<the actual diagnosis>",
  "result": "<correct|partial|wrong>"
}
```

## DECISION TREE CONSTRUCTION

Build a tree showing how the student's questions led to the diagnosis:

1. **Root node**: The chief complaint (type="symptom", asked=true)
2. **Children of root**: Main symptoms/topics the student asked about
3. **Deeper nodes**: Tests requested, exam findings revealed, conditions ruled out
4. **Final node**: The diagnosis (type="diagnosis", asked=true if correct, false if wrong)

Node types:
- "symptom": Questions about symptoms, history, onset, duration, etc.
- "test": Physical exams, vital signs, lab tests, imaging requested
- "ruled_out": Conditions/symptoms that were ruled out by questioning
- "diagnosis": The final diagnosis (only one, at the end of a branch)

Example tree for chest pain case:
- Root: "Chest pain for 2 days" (symptom)
  - "Pain radiation to arm" (symptom, asked=true)
    - "ECG requested" (test, asked=true)
      - "ST elevation found" (test, asked=true)
        - "Acute MI" (diagnosis, asked=true)
  - "Anxiety" (ruled_out, asked=true) - ruled out because pain is physical
  - "Fever" (symptom, asked=false) - student didn't ask about this

Maximum 4 levels deep. Include 3-6 main branches showing the actual conversation flow.

## CLUES ANALYSIS

For each presenting symptom, absent symptom, and exam finding in the case:
1. Determine if the student asked about it (asked: true/false)
2. Rate importance:
   - **critical**: Essential for diagnosis, should not be missed
   - **helpful**: Useful for diagnosis but not essential
   - **minor**: Nice to know but not diagnostic

Include 6-10 clues covering the most important symptoms and findings.

## INSIGHT GENERATION

### Summary
Write a balanced 2-3 sentence assessment. Be SPECIFIC to this exact conversation - mention the actual condition and actual questions asked. Never be generic.

### Strengths (EXACTLY 2-3 items - NO MORE, NO LESS)
You MUST provide exactly 2-3 strengths. Each MUST reference a specific question or action from this conversation.

GOOD examples:
- "Asked about onset and duration of symptoms which helped narrow the diagnosis"
- "Followed up on the patient's shortness of breath appropriately"
- "Requested vital signs check before making a diagnosis"

BAD examples (NEVER use generic statements like these):
- "Good questioning" / "Completed the case" / "Nice approach"

### Improvements (EXACTLY 2-3 items - NO MORE, NO LESS)
You MUST provide exactly 2-3 improvements. Each MUST name a specific symptom, question, or exam that was missed.

GOOD examples:
- "Did not ask about pain radiation which would help localize the cardiac issue"
- "Missed asking about medication history - patient was on beta blockers"
- "Should have examined the abdomen given the GI symptoms"

BAD examples (NEVER use statements like these):
- "The correct diagnosis was X" / "Could be more thorough" / "Improve questioning"

### Tip
One SPECIFIC, ACTIONABLE recommendation that directly relates to what they missed in THIS case. Not generic advice.
Example: "For chest pain presentations, always ask about radiation to jaw/arm and associated sweating - you missed asking about radiation which would have pointed to the cardiac origin."

## EXAMPLES

### Example Insight - Good Performance
```json
{
  "summary": "Strong diagnostic interview with systematic history-taking. You correctly identified the key symptoms and reached the right diagnosis efficiently.",
  "strengths": [
    "Thorough exploration of headache characteristics including timing and triggers",
    "Appropriate follow-up on neurological symptoms",
    "Good use of physical examination to confirm findings"
  ],
  "improvements": [
    "Consider asking about family history earlier in similar presentations",
    "Could explore medication history more thoroughly"
  ],
  "tip": "When a patient presents with headache, always ask about visual changes early - they can indicate serious conditions."
}
```

### Example Insight - Poor Performance
```json
{
  "summary": "The interview missed several key symptoms that would have guided diagnosis. More systematic questioning of associated symptoms is needed.",
  "strengths": [
    "Good opening question about the chief complaint",
    "Appropriate concern for patient comfort"
  ],
  "improvements": [
    "Missed asking about fever which was a key symptom in this case",
    "Did not explore neck stiffness despite headache presentation",
    "Limited physical examination requests",
    "Jumped to diagnosis without adequate history"
  ],
  "tip": "For any patient with headache, use a checklist approach: character, location, duration, severity, associated symptoms, red flags."
}
```

## DO NOT

❌ Give scores that don't match the evaluation criteria
❌ Include clues not present in the case data
❌ Write generic feedback not specific to this conversation
❌ Include more than 10 clues
❌ Make the decision tree deeper than 4 levels
❌ Give only positive or only negative feedback
❌ Use medical jargon the student might not understand
❌ Return invalid JSON

## DO

✅ Base all evaluation on the actual conversation provided
✅ Reference specific questions the student asked or missed
✅ Provide balanced, constructive feedback
✅ Make feedback actionable and specific
✅ Ensure JSON is valid and matches the schema exactly
✅ Rate clue importance based on diagnostic relevance
✅ Build decision tree from actual conversation flow

---

## CASE DATA

{case_data}

## COMPLETE CONVERSATION

{conversation}

## STUDENT'S DIAGNOSIS

Diagnosis submitted: {student_diagnosis}
Result: {diagnosis_result}

---

Analyze the conversation and provide feedback in the JSON format specified above. Respond ONLY with valid JSON, no additional text.
"""


def format_case_data_for_patient(request: PatientSimulationRequest) -> str:
    """Format case data for the patient simulation prompt"""
    case = request.case
    return f"""
Patient Demographics:
- Age: {case.age or 'Not specified'}
- Gender: {case.gender or 'Not specified'}

Chief Complaint: {case.chief_complaint or 'Not specified'}

History: {case.history or 'Not specified'}

Duration: {case.duration or 'Not specified'}

Severity: {case.severity or 'Not specified'}

Triggers: {case.triggers or 'Not specified'}

PRESENTING SYMPTOMS (symptoms the patient HAS - reveal only when asked):
{chr(10).join(f'- {s}' for s in case.presenting_symptoms) if case.presenting_symptoms else '- None specified'}

ABSENT SYMPTOMS (symptoms the patient does NOT have - deny if asked):
{chr(10).join(f'- {s}' for s in case.absent_symptoms) if case.absent_symptoms else '- None specified'}

EXAM FINDINGS (reveal only when student performs examination):
{chr(10).join(f'- {s}' for s in case.exam_findings) if case.exam_findings else '- None specified'}

DIAGNOSIS (NEVER reveal this): {case.diagnosis}
"""


def format_conversation_history(request: PatientSimulationRequest) -> str:
    """Format conversation history for the prompt"""
    if not request.conversation_history:
        return "No previous conversation. This is the start of the encounter."

    formatted = []
    for msg in request.conversation_history:
        role = "Student" if msg.role == "user" else "Patient"
        formatted.append(f"{role}: {msg.content}")

    return "\n".join(formatted)


def format_case_data_for_feedback(request: FeedbackGenerationRequest) -> str:
    """Format case data for the feedback generation prompt"""
    case = request.case
    return f"""
Case Title: {case.title}
Specialty: {case.specialty}
Difficulty: {case.difficulty}

Case Description: {case.description}

Expected Diagnosis: {case.expected_diagnosis}
Acceptable Diagnoses: {case.acceptable_diagnoses or 'None specified'}

PRESENTING SYMPTOMS:
{chr(10).join(f'- {s}' for s in case.presenting_symptoms) if case.presenting_symptoms else '- None specified'}

ABSENT SYMPTOMS:
{chr(10).join(f'- {s}' for s in case.absent_symptoms) if case.absent_symptoms else '- None specified'}

EXAM FINDINGS:
{chr(10).join(f'- {s}' for s in case.exam_findings) if case.exam_findings else '- None specified'}
"""


def format_conversation_for_feedback(
        request: FeedbackGenerationRequest) -> str:
    """Format the conversation for feedback analysis"""
    formatted = []
    for msg in request.conversation:
        role = "Student" if msg.sender == "user" else "Patient"
        formatted.append(f"{role}: {msg.content}")

    return "\n".join(formatted)


def generate_fallback_patient_response(request: PatientSimulationRequest) -> str:
    """Generate a simple rule-based patient response when AI is unavailable"""
    case = request.case
    message = request.student_message.lower()
    presenting = case.presenting_symptoms or []
    absent = case.absent_symptoms or []
    exam_findings = case.exam_findings or []
    
    # Check for symptom questions
    symptom_keywords = {
        "pain": ["pain", "hurt", "ache", "sore"],
        "fever": ["fever", "temperature", "hot", "chills"],
        "cough": ["cough", "coughing"],
        "nausea": ["nausea", "nauseous", "sick to stomach"],
        "vomiting": ["vomit", "throw up", "throwing up"],
        "diarrhea": ["diarrhea", "loose stool", "bowel"],
        "headache": ["headache", "head hurt", "head pain"],
        "tired": ["tired", "fatigue", "exhausted", "energy"],
        "dizzy": ["dizzy", "dizziness", "lightheaded"],
        "rash": ["rash", "skin", "bumps", "itchy"],
    }
    
    # Check if asking about specific symptoms
    for symptom_name, keywords in symptom_keywords.items():
        if any(kw in message for kw in keywords):
            # Check if this symptom is in presenting symptoms
            for ps in presenting:
                if symptom_name in ps.lower() or any(kw in ps.lower() for kw in keywords):
                    return f"Yes, I've been having that. {ps}"
            # Check if this symptom is absent
            for ab in absent:
                if symptom_name in ab.lower() or any(kw in ab.lower() for kw in keywords):
                    return "No, I haven't had that."
            return "I'm not sure about that. I haven't really noticed."
    
    # Check for examination requests
    if any(word in message for word in ["examine", "check", "look at", "feel", "listen", "blood pressure", "temperature"]):
        if exam_findings:
            return f"Okay, go ahead. *The examination shows: {exam_findings[0]}*"
        return "Okay, go ahead doctor."
    
    # Check for duration/timing questions
    if any(word in message for word in ["how long", "when did", "started", "begin", "days", "hours"]):
        if case.duration:
            return f"It's been about {case.duration}."
        return "It started a few days ago, I think."
    
    # Check for severity questions
    if any(word in message for word in ["how bad", "scale", "severe", "worse", "better"]):
        if case.severity:
            return f"I'd say it's {case.severity}."
        return "It's pretty uncomfortable. Maybe a 5 or 6 out of 10?"
    
    # Check for diagnosis statements
    if any(word in message for word in ["diagnose", "diagnosis", "think it", "believe it"]):
        return "Okay doctor, what do you think it is? I hope it's nothing serious."
    
    # Default: describe chief complaint
    if case.chief_complaint:
        return f"Well, {case.chief_complaint.lower()}. It's been really bothering me."
    
    return "I'm not feeling well, doctor. Can you ask me more specific questions?"


async def generate_patient_response(
        request: PatientSimulationRequest) -> PatientSimulationResponse:
    """Generate a patient response using Gemini with fallback"""
    import asyncio
    
    prompt = PATIENT_SIMULATION_PROMPT.format(
        case_data=format_case_data_for_patient(request),
        conversation_history=format_conversation_history(request),
        student_message=request.student_message)

    # Try with retry for rate limits
    max_retries = 2
    for attempt in range(max_retries):
        try:
            response = client.messages.create(
                model=CLAUDE_MODEL,
                max_tokens=500,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            patient_response = response.content[0].text.strip()
            return PatientSimulationResponse(patient_response=patient_response,
                                             revealed_symptoms=[],
                                             internal_notes=None)
        except Exception as e:
            error_str = str(e)
            print(f"AI attempt {attempt + 1} failed: {error_str[:200]}")
            if "429" in error_str or "rate" in error_str.lower():
                if attempt < max_retries - 1:
                    # Wait and retry
                    print(f"Rate limited, retrying in 5s...")
                    await asyncio.sleep(5)
                    continue
            # For other errors or final attempt, use fallback
            print(f"Using fallback response")
            break
    
    # Use rule-based fallback when AI is unavailable
    fallback_response = generate_fallback_patient_response(request)
    return PatientSimulationResponse(patient_response=fallback_response,
                                     revealed_symptoms=[],
                                     internal_notes=None)


def compare_diagnoses(user_diagnosis: str, expected_diagnosis: str) -> str:
    """Use AI to compare user diagnosis with expected diagnosis.
    Returns: 'correct', 'partial', or 'wrong'
    """
    if not user_diagnosis or len(user_diagnosis.strip()) < 2:
        return "wrong"
    
    user_diag = user_diagnosis.lower().strip()
    expected = expected_diagnosis.lower().strip()
    
    # Quick exact match check
    if user_diag == expected:
        return "correct"
    
    # Quick substring check for obvious matches (min 4 chars)
    if len(user_diag) >= 4 and (user_diag in expected or expected in user_diag):
        return "correct"
    
    # Use AI for fuzzy matching
    prompt = f"""Compare these two medical diagnoses and determine if they refer to the same condition.

User's diagnosis: "{user_diagnosis}"
Expected diagnosis: "{expected_diagnosis}"

Consider:
- Common abbreviations (e.g., "UTI" = "Urinary Tract Infection")
- Synonyms (e.g., "cold" = "common cold", "flu" = "influenza")
- Laymen terms vs medical terms (e.g., "heart attack" = "myocardial infarction")
- Minor spelling variations

Respond with ONLY one word:
- "correct" if they refer to the same condition
- "partial" if they are related but not the same (e.g., user said "infection" when answer was "strep throat")
- "wrong" if they are completely different conditions

Your answer:"""

    try:
        response = client.messages.create(
            model=CLAUDE_MODEL,
            max_tokens=10,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        result = response.content[0].text.strip().lower()
        if "correct" in result:
            return "correct"
        elif "partial" in result:
            return "partial"
        else:
            return "wrong"
    except Exception as e:
        print(f"AI diagnosis comparison error: {e}")
        # Fallback to simple word matching
        if any(w in expected for w in user_diag.split() if len(w) >= 4):
            return "partial"
        return "wrong"


def extract_json_from_response(text: str) -> str:
    """Extract JSON from AI response, handling various formats"""
    text = text.strip()
    
    # Remove markdown code blocks
    if "```json" in text:
        start = text.find("```json") + 7
        end = text.find("```", start)
        if end > start:
            text = text[start:end].strip()
    elif "```" in text:
        start = text.find("```") + 3
        end = text.find("```", start)
        if end > start:
            text = text[start:end].strip()
    
    # Find JSON object boundaries
    start_brace = text.find("{")
    end_brace = text.rfind("}")
    if start_brace != -1 and end_brace != -1 and end_brace > start_brace:
        text = text[start_brace:end_brace + 1]
    
    return text.strip()


async def generate_feedback(
        request: FeedbackGenerationRequest) -> FeedbackGenerationResponse:
    """Generate detailed feedback using Gemini"""

    prompt = FEEDBACK_GENERATION_PROMPT.format(
        case_data=format_case_data_for_feedback(request),
        conversation=format_conversation_for_feedback(request),
        student_diagnosis=request.student_diagnosis,
        diagnosis_result=request.diagnosis_result)

    try:
        response = client.messages.create(
            model=CLAUDE_MODEL,
            max_tokens=2500,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        response_text = extract_json_from_response(response.content[0].text)
        feedback_data = json.loads(response_text)
        
    except (json.JSONDecodeError, Exception) as e:
        print(f"AI feedback error: {e}")
        return create_fallback_feedback(request, reason=str(e))

    try:
        # Safely extract with defaults
        breakdown_data = feedback_data.get("breakdown", {})
        breakdown = ScoreBreakdown(
            correct_diagnosis=breakdown_data.get("correct_diagnosis", 0),
            key_questions=breakdown_data.get("key_questions", 0),
            right_tests=breakdown_data.get("right_tests", 0),
            time_efficiency=breakdown_data.get("time_efficiency", 0),
            ruled_out_differentials=breakdown_data.get("ruled_out_differentials", 0))

        def parse_tree(node_data: dict) -> DecisionTreeNode:
            return DecisionTreeNode(
                id=node_data.get("id", "node"),
                label=node_data.get("label", "Unknown"),
                type=node_data.get("type", "symptom"),
                asked=node_data.get("asked", True),
                children=[parse_tree(c) for c in node_data.get("children", [])]
            )

        tree_data = feedback_data.get("decision_tree", {"id": "root", "label": "Interview", "type": "symptom", "asked": True, "children": []})
        decision_tree = parse_tree(tree_data)

        clues = []
        for i, c in enumerate(feedback_data.get("clues", [])):
            clues.append(MissedClue(
                id=c.get("id", f"clue{i}"),
                text=c.get("text", "Unknown"),
                importance=c.get("importance", "helpful"),
                asked=c.get("asked", False)
            ))

        insight_data = feedback_data.get("insight", {})
        insight = AIInsight(
            summary=insight_data.get("summary", f"Review your approach to this {request.case.specialty} case."),
            strengths=insight_data.get("strengths", ["Engaged with the patient"]),
            improvements=insight_data.get("improvements", ["Consider a more systematic approach"]),
            tip=insight_data.get("tip", "Use structured history-taking for consistent results."))

        return FeedbackGenerationResponse(
            score=feedback_data.get("score", 50),
            breakdown=breakdown,
            decision_tree=decision_tree,
            clues=clues,
            insight=insight,
            user_diagnosis=feedback_data.get("user_diagnosis", request.student_diagnosis),
            correct_diagnosis=feedback_data.get("correct_diagnosis", request.case.expected_diagnosis),
            result=feedback_data.get("result", request.diagnosis_result),
            source=FeedbackSource(is_ai_generated=True, reason=None))

    except Exception as e:
        print(f"AI feedback parsing error: {e}")
        return create_fallback_feedback(request, reason=str(e))


def analyze_conversation_for_clues(request: FeedbackGenerationRequest) -> tuple[list[MissedClue], list[str], list[str]]:
    """Analyze conversation to find what was asked about and what was missed"""
    case = request.case
    conversation_text = " ".join([m.content.lower() for m in request.conversation])
    
    clues = []
    strengths = []
    improvements = []
    
    presenting = case.presenting_symptoms or []
    absent = case.absent_symptoms or []
    exam_findings = case.exam_findings or []
    
    # Check which symptoms were explored
    symptom_keywords = {
        "pain": ["pain", "hurt", "ache", "sore"],
        "fever": ["fever", "temperature", "hot", "chills"],
        "cough": ["cough", "coughing"],
        "nausea": ["nausea", "nauseous", "sick"],
        "vomiting": ["vomit", "throw up", "throwing up"],
        "fatigue": ["tired", "fatigue", "exhausted", "energy"],
        "headache": ["headache", "head hurt", "head pain"],
        "rash": ["rash", "skin", "itchy", "itch"],
        "breathing": ["breath", "breathing", "shortness"],
        "swelling": ["swell", "swollen", "swelling"],
        "duration": ["how long", "when did", "started", "began"],
        "severity": ["how bad", "scale", "worse", "better"],
        "medications": ["medication", "medicine", "taking", "drugs"],
        "allergies": ["allergy", "allergic", "allergies"],
        "history": ["history", "before", "previous", "past"],
    }
    
    asked_about = set()
    for keyword, variations in symptom_keywords.items():
        if any(v in conversation_text for v in variations):
            asked_about.add(keyword)
    
    # Generate clues from presenting symptoms
    for i, symptom in enumerate(presenting[:5]):
        symptom_lower = symptom.lower()
        was_asked = any(kw in symptom_lower or any(v in conversation_text for v in variations) 
                        for kw, variations in symptom_keywords.items() if kw in symptom_lower)
        
        clues.append(MissedClue(
            id=f"p{i+1}",
            text=symptom,
            importance="critical" if i < 2 else "helpful",
            asked=was_asked
        ))
        
        if was_asked and i < 2:
            strengths.append(f"Asked about {symptom.lower()}")
        elif not was_asked and i < 3:
            improvements.append(f"Missed asking about {symptom.lower()} - a key symptom")
    
    # Add general interview clues
    if "duration" in asked_about:
        strengths.append("Inquired about symptom duration and timeline")
    else:
        improvements.append("Should ask about when symptoms started and how long they've lasted")
    
    if "medications" in asked_about or "history" in asked_about:
        strengths.append("Explored patient's medical history")
    
    # Add conversation-specific strengths based on what was actually asked
    question_count = len([m for m in request.conversation if m.sender == "user"])
    
    if len(strengths) < 2:
        if question_count >= 3:
            strengths.append(f"Asked {question_count} questions to explore the patient's condition")
        else:
            strengths.append("Initiated the diagnostic process with the patient")
    if len(strengths) < 2:
        if "how long" in conversation_text or "when" in conversation_text:
            strengths.append("Explored the timeline of symptoms")
        elif presenting:
            strengths.append(f"Addressed the patient's main concern about {presenting[0].lower()}")
    
    # Add specific improvements based on what was missed from the case
    if len(improvements) < 2:
        missed_symptoms = [s for i, s in enumerate(presenting[:3]) 
                         if not any(word in conversation_text for word in s.lower().split()[:2])]
        if missed_symptoms:
            improvements.append(f"Could have asked about {missed_symptoms[0].lower()} - an important symptom in this case")
        else:
            improvements.append(f"Consider exploring what makes the symptoms better or worse")
    if len(improvements) < 2:
        if exam_findings and "examine" not in conversation_text and "check" not in conversation_text:
            improvements.append(f"Physical examination would help - key findings include {exam_findings[0].lower()}")
        elif absent and len(absent) > 0:
            improvements.append(f"Asking about {absent[0].lower()} would help rule out other conditions")
    
    return clues[:6], strengths[:3], improvements[:3]


def build_decision_tree_from_conversation(request: FeedbackGenerationRequest) -> DecisionTreeNode:
    """Build a decision tree from the actual conversation"""
    case = request.case
    conversation = request.conversation
    
    # Extract topics from student messages
    student_messages = [m.content.lower() for m in conversation if m.sender == "user"]
    conversation_text = " ".join(student_messages)
    
    # Keywords for detecting different types of questions
    symptom_keywords = ["pain", "hurt", "ache", "feel", "symptom", "when", "how long", "worse", "better", "start"]
    test_keywords = ["examine", "check", "look at", "test", "blood pressure", "temperature", "listen", "vital"]
    history_keywords = ["history", "before", "medication", "allergy", "family", "previous"]
    
    # Build tree children based on what student asked
    tree_children = []
    
    # Check for symptom questions
    asked_symptoms = []
    presenting = case.presenting_symptoms or []
    for symptom in presenting[:3]:
        symptom_lower = symptom.lower()
        symptom_words = symptom_lower.split()
        if any(word in conversation_text for word in symptom_words if len(word) > 3):
            asked_symptoms.append(symptom)
    
    # Add symptom branches
    for i, symptom in enumerate(asked_symptoms[:2]):
        tree_children.append(DecisionTreeNode(
            id=f"sym{i+1}",
            label=symptom[:40],
            type="symptom",
            asked=True,
            children=[]
        ))
    
    # Check for tests/exams
    if any(kw in conversation_text for kw in test_keywords):
        exam_findings = case.exam_findings or []
        if exam_findings:
            tree_children.append(DecisionTreeNode(
                id="test1",
                label=exam_findings[0][:40] if exam_findings else "Physical exam",
                type="test",
                asked=True,
                children=[]
            ))
    
    # Check for history
    if any(kw in conversation_text for kw in history_keywords):
        tree_children.append(DecisionTreeNode(
            id="hist",
            label="Medical history reviewed",
            type="symptom",
            asked=True,
            children=[]
        ))
    
    # Add missed important symptoms as not asked
    for i, symptom in enumerate(presenting[:2]):
        if symptom not in asked_symptoms:
            tree_children.append(DecisionTreeNode(
                id=f"missed{i}",
                label=f"{symptom[:35]}",
                type="symptom",
                asked=False,
                children=[]
            ))
    
    # Add final diagnosis
    is_correct = request.diagnosis_result == "correct"
    tree_children.append(DecisionTreeNode(
        id="diag",
        label=request.student_diagnosis,
        type="diagnosis",
        asked=is_correct,
        children=[]
    ))
    
    # Root node with chief complaint
    chief = case.title[:60] if case.title else "Patient presents with symptoms"
    
    return DecisionTreeNode(
        id="root",
        label=chief,
        type="symptom",
        asked=True,
        children=tree_children
    )


def create_fallback_feedback(
        request: FeedbackGenerationRequest, reason: str = "AI response parsing failed") -> FeedbackGenerationResponse:
    """Create case-specific fallback feedback if AI parsing fails"""
    
    case = request.case
    score_map = {"correct": 85, "partial": 55, "wrong": 25}
    base_score = score_map.get(request.diagnosis_result, 50)
    
    # Analyze the actual conversation
    clues, strengths, improvements = analyze_conversation_for_clues(request)
    
    # Build conversation-based decision tree
    decision_tree = build_decision_tree_from_conversation(request)
    
    # Generate case-specific tip
    presenting = case.presenting_symptoms or []
    specialty_tips = {
        "General Medicine": f"For {case.expected_diagnosis}, key symptoms include: {', '.join(presenting[:3]) if presenting else 'the presenting complaints'}. Always explore these thoroughly.",
        "Cardiology": "For cardiac cases, always ask about radiation of pain, associated symptoms like sweating or nausea, and risk factors.",
        "Pulmonology": "For respiratory cases, assess onset, character of cough, sputum production, and any breathing difficulties.",
        "Pediatrics": "For pediatric cases, consider developmental history, immunization status, and how symptoms affect daily activities.",
    }
    
    tip = specialty_tips.get(
        case.specialty,
        f"For {case.expected_diagnosis}, focus on the characteristic symptoms: {', '.join(presenting[:2]) if presenting else 'presenting complaints'}."
    )
    
    # Build summary based on result
    if request.diagnosis_result == "correct":
        summary = f"Excellent work! You correctly diagnosed {case.expected_diagnosis}. Your questioning approach led you to the right conclusion."
    elif request.diagnosis_result == "partial":
        summary = f"You were close with '{request.student_diagnosis}'. The correct diagnosis was {case.expected_diagnosis}. Review the distinguishing features between these conditions."
    else:
        summary = f"The correct diagnosis was {case.expected_diagnosis}, not {request.student_diagnosis}. Review the key symptoms that differentiate this condition."

    return FeedbackGenerationResponse(
        score=base_score,
        breakdown=ScoreBreakdown(
            correct_diagnosis=40 if request.diagnosis_result == "correct" else
            (20 if request.diagnosis_result == "partial" else 5),
            key_questions=12 if len([c for c in clues if c.asked]) > 2 else 8,
            right_tests=15,
            time_efficiency=8,
            ruled_out_differentials=10 if request.diagnosis_result == "correct" else 5),
        decision_tree=decision_tree,
        clues=clues if clues else [
            MissedClue(id="c1", text="Chief complaint explored", importance="critical", asked=True),
            MissedClue(id="c2", text="Duration of symptoms", importance="helpful", asked=True),
        ],
        insight=AIInsight(
            summary=summary,
            strengths=strengths,
            improvements=improvements,
            tip=tip
        ),
        user_diagnosis=request.student_diagnosis,
        correct_diagnosis=case.expected_diagnosis,
        result=request.diagnosis_result,
        source=FeedbackSource(is_ai_generated=False, reason=reason))
