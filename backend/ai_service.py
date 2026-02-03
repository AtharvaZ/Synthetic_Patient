"""
AI Service for patient simulation and feedback generation using Gemini
"""

import os
import json
from google import genai
from google.genai import types
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
)

# Configure Gemini client
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY", ""))

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
    "label": "Initial Presentation",
    "correct": null,
    "children": [
      {
        "id": "q1",
        "label": "<first key question or topic explored>",
        "correct": <true/false based on relevance>,
        "children": [...]
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

Build the decision tree based on the student's actual questioning path:
1. Start with "Initial Presentation" as root
2. Each major topic/question branch becomes a child node
3. Mark nodes as correct=true if the question was relevant to the diagnosis
4. Mark nodes as correct=false if the question was irrelevant or a tangent
5. Maximum depth of 4 levels
6. Include 3-6 main branches representing key conversation topics

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


async def generate_patient_response(
        request: PatientSimulationRequest) -> PatientSimulationResponse:
    """Generate a patient response using Gemini"""

    prompt = PATIENT_SIMULATION_PROMPT.format(
        case_data=format_case_data_for_patient(request),
        conversation_history=format_conversation_history(request),
        student_message=request.student_message)

    response = client.models.generate_content(
        model="gemini-2.5-flash-lite",
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.7,
            max_output_tokens=500,
        ))

    patient_response = response.text.strip()

    return PatientSimulationResponse(patient_response=patient_response,
                                     revealed_symptoms=[],
                                     internal_notes=None)


async def generate_feedback(
        request: FeedbackGenerationRequest) -> FeedbackGenerationResponse:
    """Generate detailed feedback using Gemini"""

    prompt = FEEDBACK_GENERATION_PROMPT.format(
        case_data=format_case_data_for_feedback(request),
        conversation=format_conversation_for_feedback(request),
        student_diagnosis=request.student_diagnosis,
        diagnosis_result=request.diagnosis_result)

    response = client.models.generate_content(
        model="gemini-2.5-flash-lite",
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.3,
            max_output_tokens=2000,
        ))

    response_text = response.text.strip()
    if response_text.startswith("```json"):
        response_text = response_text[7:]
    if response_text.startswith("```"):
        response_text = response_text[3:]
    if response_text.endswith("```"):
        response_text = response_text[:-3]
    response_text = response_text.strip()

    try:
        feedback_data = json.loads(response_text)
    except json.JSONDecodeError as e:
        return create_fallback_feedback(request)

    try:
        breakdown = ScoreBreakdown(
            correct_diagnosis=feedback_data["breakdown"]["correct_diagnosis"],
            key_questions=feedback_data["breakdown"]["key_questions"],
            right_tests=feedback_data["breakdown"]["right_tests"],
            time_efficiency=feedback_data["breakdown"]["time_efficiency"],
            ruled_out_differentials=feedback_data["breakdown"]
            ["ruled_out_differentials"])

        def parse_tree(node_data: dict) -> DecisionTreeNode:
            return DecisionTreeNode(id=node_data.get("id", "node"),
                                    label=node_data.get("label", "Unknown"),
                                    correct=node_data.get("correct"),
                                    children=[
                                        parse_tree(c)
                                        for c in node_data.get("children", [])
                                    ])

        decision_tree = parse_tree(feedback_data["decision_tree"])

        clues = [
            MissedClue(id=c["id"],
                       text=c["text"],
                       importance=c["importance"],
                       asked=c["asked"]) for c in feedback_data["clues"]
        ]

        insight = AIInsight(
            summary=feedback_data["insight"]["summary"],
            strengths=feedback_data["insight"]["strengths"],
            improvements=feedback_data["insight"]["improvements"],
            tip=feedback_data["insight"]["tip"])

        return FeedbackGenerationResponse(
            score=feedback_data["score"],
            breakdown=breakdown,
            decision_tree=decision_tree,
            clues=clues,
            insight=insight,
            user_diagnosis=feedback_data["user_diagnosis"],
            correct_diagnosis=feedback_data["correct_diagnosis"],
            result=feedback_data["result"])

    except (KeyError, TypeError) as e:
        return create_fallback_feedback(request)


def create_fallback_feedback(
        request: FeedbackGenerationRequest) -> FeedbackGenerationResponse:
    """Create fallback feedback if AI parsing fails"""

    score_map = {"correct": 85, "partial": 55, "wrong": 25}
    base_score = score_map.get(request.diagnosis_result, 50)

    return FeedbackGenerationResponse(
        score=base_score,
        breakdown=ScoreBreakdown(
            correct_diagnosis=40 if request.diagnosis_result == "correct" else
            (20 if request.diagnosis_result == "partial" else 5),
            key_questions=15,
            right_tests=15,
            time_efficiency=7,
            ruled_out_differentials=8),
        decision_tree=DecisionTreeNode(
            id="root",
            label="Clinical Interview",
            correct=None,
            children=[
                DecisionTreeNode(id="q1",
                                 label="Chief Complaint",
                                 correct=True,
                                 children=[]),
                DecisionTreeNode(id="q2",
                                 label="History Taking",
                                 correct=True,
                                 children=[]),
                DecisionTreeNode(id="q3",
                                 label="Diagnosis",
                                 correct=request.diagnosis_result == "correct",
                                 children=[])
            ]),
        clues=[
            MissedClue(id="c1",
                       text="Chief complaint explored",
                       importance="critical",
                       asked=True),
            MissedClue(id="c2",
                       text="Duration of symptoms",
                       importance="helpful",
                       asked=True),
        ],
        insight=AIInsight(
            summary=
            f"You submitted a {'correct' if request.diagnosis_result == 'correct' else 'partially correct' if request.diagnosis_result == 'partial' else 'incorrect'} diagnosis. Review the case details to understand the key findings.",
            strengths=[
                "Engaged with the patient and gathered information",
                "Worked through the diagnostic process",
                "Attempted to reach a conclusion"
            ],
            improvements=[
                "Consider asking about symptom onset, duration, and severity",
                "Explore associated symptoms systematically",
                "Request relevant physical examination findings"
            ],
            tip=
            "Use a structured history-taking framework for consistent results."
        ),
        user_diagnosis=request.student_diagnosis,
        correct_diagnosis=request.case.expected_diagnosis,
        result=request.diagnosis_result)
