import json
import os

with open("questions_responses.json", "r") as f:
    data = json.load(f)


for category, questions in data.items(): 
    math_mcq_questions = {}
    math_spr_questions = {}
    reading_mcq_questions = {}

    for ext_id, question_data in questions.items():
        print(f"Processing question ID: {ext_id} in category: {category}")
        qtype = question_data.get("type", "").lower()  
        if qtype == "mcq" and category == "math":
            math_mcq_questions[ext_id] = question_data
        elif qtype == "spr" and category == "math":
            math_spr_questions[ext_id] = question_data
        else:
            reading_mcq_questions[ext_id] = question_data

    if math_mcq_questions:
        with open(f"server/{category}_mcq.json", "w") as f:
            json.dump(math_mcq_questions, f, indent=2)
    if math_spr_questions:
        with open(f"server/{category}_spr.json", "w") as f:
            json.dump(math_spr_questions, f, indent=2)
    if reading_mcq_questions:
        with open(f"server/{category}_mcq.json", "w") as f:
            json.dump(reading_mcq_questions, f, indent=2)

print("Done! JSON files saved")
