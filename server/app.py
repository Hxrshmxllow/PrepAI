from flask import Flask,jsonify, request
from flask_cors import CORS
from db import get_random_firestore_question, log_question, get_user_metrics
from firebase import verify_firebase_token
from dotenv import load_dotenv
import os
from gemini_api import generate_sat_question
import json

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return jsonify({"message": 'You have reached the PrepAI backend!'})

@app.route('/api/get_question', methods=['GET'])
def get_question():
    subject = request.args.get('subject')
    area = request.args.get('area')
    difficulty = request.args.get("difficulty")
    type = request.args.get("type")
    userToken = request.args.get("userToken")
    question = get_random_firestore_question(subject, area, difficulty, type, userToken)
    if question:
        question['correct_answer'] = question['correct_answer'][2]
        print(question['correct_answer'])
        return jsonify(question)
    else:
        return jsonify({"error": "No question found"}), 404
    
@app.route("/auth/google", methods=["POST"])
def google_auth():
    data = request.get_json()
    token = data.get("token")
    if not token:
        return jsonify({"status": "error", "message": "Token missing"}), 400
    try:
        user_info = verify_firebase_token(token)
        return jsonify({"status": "success", "user": user_info})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 401
    
@app.route("/api/log_question", methods=["POST"])
def log_seen_question():
    data = request.get_json()
    token = data.get("token")
    user_id = data.get("user_id")
    question = data.get("question")
    isCorrect = data.get("isCorrect")
    print(isCorrect)
    logged = log_question(user_id, token, question, isCorrect)
    return jsonify({"status": "success", "message": "Question logged as seen"})

@app.route("/api/get_user_data", methods=["POST"])
def get_user_data():
    uid = request.args.get("uid")
    id_token = request.headers.get("Authorization")
    res = get_user_metrics(uid, id_token)
    if res is not None:
        return jsonify(res)
    else:
        return jsonify({"math_accuracy": 0.00,
        "reading_accuracy": 0.00,
        "math_areas": 0.00,
        "reading_areas": 0.00})

@app.route("/api/get_question_ai", methods=["GET"])
def get_question_ai():
    print("here")
    difficulties = {"e": "Easy", "m": "Medium", "h": "Hard"}
    difficulty_code = request.args.get("difficulty")
    difficulty = difficulties.get(difficulty_code, "Medium")
    result = generate_sat_question(
        skill_desc=request.args.get("skill_desc", ""),
        difficulty=difficulty,
        subject=request.args.get("subject", ""),
        area=request.args.get("area", ""),
        qtype=request.args.get("type", ""),
        score_band=request.args.get("score_band", "")
    )
    if result is None:
        return jsonify({"status": "error", "message": "AI generation failed"}), 500
    print(result)
    answer_options = result.get("answerOptions", "[]")
    if isinstance(answer_options, str):
        result["answerOptions"] = json.loads(answer_options)
    else:
        result["answerOptions"] = answer_options
    result['correct_answer'] = result['correct_answer'][2]
    return jsonify(result)


if __name__ == '__main__':
    app.run(debug=True)