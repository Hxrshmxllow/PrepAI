from google import genai
import os
from dotenv import load_dotenv
import json, uuid, re

def generate_sat_question(skill_desc, difficulty, subject, area, qtype, score_band):
    load_dotenv()
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    prompt = f"""
You are an expert SAT question author. Generate **one official-style SAT {subject} question**.

Use this metadata:
- Subject: {subject}
- Area: {area}
- Skill: {skill_desc}
- Difficulty: {difficulty}
- Type: {qtype}
- Score Band: {score_band}

Return your response as **valid JSON only** matching this exact structure:

{{
  "id": "uuid string",
  "subject": "{subject}",
  "area": "{area}",
  "skill_desc": "{skill_desc}",
  "difficulty": "{difficulty}",
  "type": "{qtype}",
  "stem": "<p style=\\"text-align: left;\\">SAT-style question HTML with <math>...</math></p>",
  "stimulus": "",
  "answerOptions": "[{{\\"id\\": \\"uuid1\\", \\"content\\": \\"<p><math>...</math></p>\\"}}, {{...}}]",
  "correct_answer": "['A']",
  "rationale": "<p style=\\"text-align: left;\\">Choice A is correct because...</p>",
  "score_band_range_cd": "{score_band}"
}}

Rules:
- Return ONLY JSON (no Markdown, no ```json fences).
- Use proper escaping for double quotes inside HTML.
- Each answerOption must have a unique UUID and a <math> tag.
- Use clear SAT logic and structure.
- Correct answer should match one of the answerOptions.
    """

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config={"response_mime_type": "application/json"}
    )

    raw = response.text.strip()
    if raw.startswith("```"):
        raw = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw, flags=re.DOTALL).strip()

    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        print("❌ Invalid JSON returned:")
        print(response.text)
        return None

    if not data.get("id"):
        data["id"] = str(uuid.uuid4())

    return data


