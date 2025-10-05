import os
import requests
from firebase_admin import credentials, initialize_app, storage, firestore, auth
from google.oauth2 import service_account
import google.auth.transport.requests
import json
import random

FIREBASE_KEY = "server/firebase_service_account.json"
FIREBASE_DB = "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40prepai-5c250.iam.gserviceaccount.com"
FIREBASE_API = "MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDeC+bP+9irRMOk\nI3UViVpjcPtX/7/RNVmEHFmnukqrDnuIE6N/z3/YI4dK5K0ozfniB5Lr+QvFyK5Y\nWL8R2CtdIXyB/3q1boRusv7nz54w0gGi9qg1dT/UqpyegwwiaEGRb4ZqhpiJTass\nR7tfKMfmPZtGbixKdjwfLFkXawKLX07VGP7EPN7A6ZAPATSYvBpfuuZT/i99gJ6P\nlLAocGVI5bJqJVfFAapdNJSC3m3/g61ERnYjuJFpxuydoju0OAPLkJkPI1TlbU3t\nHxUcY9L0tM+0UI8HXr8cbfWUspih1oq3DFgoFHTkjKnummlspXwnXFWwXcfzjicB\nIcM2u+FTAgMBAAECggEAJtg8K7xqPiQMecV+MSNTPbxBLDbgjq/flh4DjTUo5N3m\nvHp7Ctv5CI3GmFKC/HV0NpeOm1t5NMOTxH7aBjwj8enuxyszg1PvNRJ5R4JpsS67\n/I9cA+YcIY8rUQup7scAWXoCMNaVDsgYnul5nP8cYWn7pQmXE/u1LtrqRw+AZXMW\nbWFlmZf1JzmsZddduZJmxRefy5KDtkfeckkpCBLiplQ/nNzMQcUeK3/LCKc1dR8A\nSEeuGOaIr3IbOCh6omnAkuga1KmGVwve8AUDjYo9Lb/L/qGTmpOcRKuPOt3doKQm\ntM5AGu+dLXPBo/1B81T+nighkrEZxNGXCK49cx3akQKBgQD5bBVbbXn0Q7TPk5Ud\nEFHp0cr3LAn8bADy8z/TMvxYOXPEFMtue9wuNunJ85alTiBw5HXc+rCRSx2WNrqc\nAFGa24xBQNWldaPNhQXy+a/yFAbnNPMOT93VxPH+OxXHIv6TJ/o6UyeQ4E87r80S\nX9eHuPmCz6/45GOsMXZnahZqGwKBgQDj5v9UOmQuL54EtSAMtGwOwokANf3n+ygr\ndkq9ty4Z2ZcWY4sN6ia24gikMFUze/06jzKL4k1AXDoJKSCtukcG6/AecsUIZ3+X\n8ZPt2fXBNzQ+f6SMQeSRidym+qVb97EySN6x+rZFl5EpY47A8UY4D9Q85hy0sNGR\n04D5vtzZKQKBgQCjjDCw46cs+NxtpAsJpLLhi9P3oSPnJXa117TJKsx2mS2ErFH8\nXzEwCIfiCVyFhiYVgGicfrEahFOhNL/GHRtlXIKqIvY0aWAAGjKdcQXiySkBoCGk\nB9ChJGO9XUbZbePZ4EPezLnL8JljvNHOM5QjBbJuCPsNS8zjkwddph2OcwKBgQCk\ngTdIyyVJGWIMr9lEkm91cAKIPnDapLZoOOjWbIVAb4nZxVy4XI45cIsgSSsXEKbH\nQFoSEvYEQQ47Uo6eGFnwqxoWQG3tFRhKyzwmcjAsmfaCLozOGTotu7+kYERAUFh9\nnY/yFLDBJxjHMW/34bD4AqUGmGucGg4MHwl4PMcZkQKBgCtisaYfWcY0HujGed09\n08gXgbY9JgFmmPRfD6ngDZPpx1oBBuVjXRSb8KNnbTBWtKAc5fSuUWeHw9uwZJ2S\nC8Xok3hQbLqPhXMeWMBPoSobOEFxnMtpp8bFgyf9KK9wEvvYMW4r6OKYSQK0dlW7\nlDxSpJ2gYP8S8bQEty4+DN66"
BASE_URL = f"https://firestore.googleapis.com/v1/projects/prepai-5c250/databases/(default)/documents"
SCOPES = ["https://www.googleapis.com/auth/datastore"]
SERVICE_ACCOUNT_FILE = "server/firebase_service_account.json"  

def __init__():
    try:
        cred = credentials.Certificate(FIREBASE_KEY) 
        initialize_app(cred, {
            'storageBucket': 'prepai-5c250.firebasestorage.app'
        })
        bucket = storage.bucket() 
        db = firestore.client()
        print("Firebase Storage initialized successfully!")
    except Exception as e:
        print(f"Error initializing Firebase Storage: {e}")

    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES
    )
    auth_req = google.auth.transport.requests.Request()
    creds.refresh(auth_req)
    access_token = creds.token
    headers = {"Authorization": f"Bearer {access_token}"}


def upload_to_firestore(filepath, subject):
    with open(filepath, "r") as f:
        data = json.load(f)
    for qid, item in data.items():
        q_type = item.get("type")
        if q_type not in ["mcq", "spr"]:
            continue
        area = str(item.get("primary_class_cd_desc")).replace(" ", "_")
        difficulty = str(item.get("difficulty")).lower()
        path = f"subjects/{subject}/areas/{area}/{difficulty}/questions/{q_type}"
        url = f"{BASE_URL}/{path}?documentId={qid}&key={FIREBASE_API}"
        doc_data = {
            "fields": {
                "id": {"stringValue": qid},
                "stem": {"stringValue": item.get("stem", "")},
                "stimulus": {"stringValue": item.get("stimulus", "")},
                "answerOptions": {"stringValue": json.dumps(item.get("answerOptions", []))},
                "rationale": {"stringValue": item.get("rationale", "")},
                "correct_answer": {"stringValue": str(item.get("correct_answer", ""))},
                "score_band_range_cd": {"stringValue": str(item.get("score_band_range_cd"))},
                "skill_desc": {"stringValue": item.get("skill_desc")},
            }
        }
        response = requests.post(url, headers=headers, json=doc_data)
        if response.status_code == 200:
            print(f"✅ Uploaded {qid} to {path}")
        else:
            print(f"❌ Failed {qid}: {response.status_code} {response.text}")

def get_random_firestore_question(subject, area, difficulty, type, id_token):
    headers = {
        "Authorization": f"Bearer {id_token}",
        "Content-Type": "application/json"
    }
    diffuclties = {"e", "m", "h"}
    if difficulty == None: difficulty = random.choice(diffuclties)
    if subject == "full":
        subject = random.choice(["reading", "math"])
    if subject == "reading":
        if area == None: area = random.choice(["Craft_and_Structure", "Expression_of_Ideas", "Information_and_Ideas", "Standard_English_Conventions"])
        if type == None: type = "mcq"
    else:
        if area == None: area = random.choice(["Algebra", "Geometry_and_Trigonometry", "Advanced_Math", "Problem-Solving_and_Data_Analysis"])
        if type == None: type = random.choice(["mcq", "spr"])
   
    url = f"{BASE_URL}/subjects/{subject}/areas/{area}/{difficulty}/questions/{type}"
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        docs = response.json().get("documents", [])
        if not docs:
            print("No documents found in collection.")
            return None
        doc = random.choice(docs)
        fields = doc.get("fields", {})
        question_data = {
            "id": fields.get("id", {}).get("stringValue", ""),
            "stem": fields.get("stem", {}).get("stringValue", ""),
            "answerOptions": json.loads(fields.get("answerOptions", {}).get("stringValue", "[]")),
            "rationale": fields.get("rationale", {}).get("stringValue", ""),
            "correct_answer": fields.get("correct_answer", {}).get("stringValue", ""),
            "score_band_range_cd": fields.get("score_band_range_cd", {}).get("stringValue", ""),
            "skill_desc": fields.get("skill_desc", {}).get("stringValue", ""),
            "difficulty": difficulty,
            "subject": subject,
            "area": area, 
            "type": type
        }
        if subject == "reading":
            question_data["stimulus"] = fields.get("stimulus", {}).get("stringValue", "")
        return question_data
    else:
        print(f"Failed to fetch docs: {response.status_code} {response.text}")
        return None

def log_question(user_id, id_token, question, is_correct):
    weights = {'e': 0.8, 'm': 1.0, 'h': 1.2}
    weight = weights.get(question["difficulty"], 1.0)

    headers = {
        "Authorization": f"Bearer {id_token}",
        "Content-Type": "application/json"
    }

    user_url = f"{BASE_URL}/users/{user_id}?key={FIREBASE_API}"
    user_response = requests.get(user_url, headers=headers)

    if user_response.status_code == 404:
        print(f"🆕 User {user_id} not found — creating default record.")

        default_data = {
            "fields": {
                "reading_accuracy": {"doubleValue": 0},
                "math_accuracy": {"doubleValue": 0},
                "math_areas": {
                    "mapValue": {
                        "fields": {
                            "Algebra": {"doubleValue": 0},
                            "Geometry_and_Trigonometry": {"doubleValue": 0},
                            "Advanced_Math": {"doubleValue": 0},
                            "Problem-Solving_and_Data_Analysis": {"doubleValue": 0}
                        }
                    }
                },
                "reading_areas": {
                    "mapValue": {
                        "fields": {
                            "Craft_and_Structure": {"doubleValue": 0},
                            "Expression_of_Ideas": {"doubleValue": 0},
                            "Information_and_Ideas": {"doubleValue": 0},
                            "Standard_English_Conventions": {"doubleValue": 0}
                        }
                    }
                }
            }
        }

        create_url = f"{BASE_URL}/users?documentId={user_id}&key={FIREBASE_API}"
        create_res = requests.post(create_url, headers=headers, json=default_data)

        if create_res.status_code not in [200, 201]:
            print(f"❌ Failed to create user: {create_res.status_code} {create_res.text}")
            return None

        print("✅ User record created successfully.")
        user_data = default_data["fields"]  

    elif user_response.status_code == 200:
        user_data = user_response.json().get("fields", {})
    else:
        print(f"❌ Failed to fetch user data: {user_response.status_code}")
        return None

    subject = question["subject"]
    area = question["area"]
    difficulty = question["difficulty"]

    if subject == "math":
        subject_accuracy = float(user_data.get("math_accuracy", {}).get("doubleValue", 0))
        area_accuracy = float(
            user_data
            .get("math_areas", {})
            .get("mapValue", {})
            .get("fields", {})
            .get(area, {})
            .get("doubleValue", 0)
        )
    else:
        subject_accuracy = float(user_data.get("reading_accuracy", {}).get("doubleValue", 0))
        area_accuracy = float(
            user_data
            .get("reading_areas", {})
            .get("mapValue", {})
            .get("fields", {})
            .get(area, {})
            .get("doubleValue", 0)
        )

    def update_accuracy(old_acc, is_correct, weight):
        return round((old_acc * 0.9) + ((1.0 if is_correct else 0.0) * weight * 0.1), 3)

    new_subject_accuracy = update_accuracy(subject_accuracy, is_correct, weight)
    new_area_accuracy = update_accuracy(area_accuracy, is_correct, weight)

    if subject == "math":
        update_data = {
            "fields": {
                "math_accuracy": {"doubleValue": new_subject_accuracy},
                "math_areas": {
                    "mapValue": {"fields": {area: {"doubleValue": new_area_accuracy}}}
                }
            }
        }
    else:
        update_data = {
            "fields": {
                "reading_accuracy": {"doubleValue": new_subject_accuracy},
                "reading_areas": {
                    "mapValue": {"fields": {area: {"doubleValue": new_area_accuracy}}}
                }
            }
        }

    update_mask = []

    if subject == "math":
        update_mask = [f"math_accuracy", f"math_areas.{area}"]
    else:
        update_mask = [f"reading_accuracy", f"reading_areas.{area}"]

    mask_params = "&".join([f"updateMask.fieldPaths={path}" for path in update_mask])

    patch_url = f"{BASE_URL}/users/{user_id}?{mask_params}&key={FIREBASE_API}"
    patch_res = requests.patch(patch_url, headers=headers, json=update_data)

    if patch_res.status_code in [200, 204]:
        print(f"✅ Updated {subject} → {area} | new acc: {new_area_accuracy}")
        return patch_res.json() if patch_res.text else {"success": True}
    else:
        print(f"❌ Firestore update error: {patch_res.status_code} {patch_res.text}")
        return None
    '''url = f"{BASE_URL}/seen_questions"
    data = {
        "fields": {
            "user_id": {"stringValue": user_id},
            "question_id": {"stringValue": question_id},
            "is_correct": {"booleanValue": is_correct},
        }
    }
    response = requests.post(url, headers=headers, json=data)
    if response.status_code == 200:
        return response.json()
    else:
        print("Error:", response.text)
        return None'''
    
def load_json(path, default):
    """Helper to safely load JSON or return default if file is empty/missing."""
    if not os.path.exists(path) or os.stat(path).st_size == 0:
        return default
    with open(path, "r") as f:
        return json.load(f)
    
def enrich_questions_responses():
    # Paths to sorted question files
    reading_questions_path = "server/questions/reading_questions.sorted.json"
    math_questions_path = "server/questions/math_questions_sorted.json"

    # Paths to response files
    math_mcq_responses_path = "server/questions/math_mcq.json"
    math_spr_responses_path = "server/questions/math_spr.json"
    reading_responses_path = "server/questions/reading_mcq.json"

    # Load responses safely (empty dict if file missing/empty)
    math_mcq = load_json(math_mcq_responses_path, {})
    math_spr = load_json(math_spr_responses_path, {})
    reading_mcq = load_json(reading_responses_path, {})

    def enrich_for_questions(questions_path):
        with open(questions_path, "r") as f:
            questions = json.load(f)

        for q in questions:
            uid = q["external_id"]

            # Decide which response dict it belongs to
            if uid in math_mcq:
                target = math_mcq
            elif uid in math_spr:
                target = math_spr
            elif uid in reading_mcq:
                target = reading_mcq
            else:
                # if uid wasn't found in any file, skip or log
                print(f"{questions_path} {uid} not found in any response file")
                continue

            # Init if missing
            if uid not in target:
                target[uid] = {
                    "score_band_range_cd": None,
                    "skill_desc": None,
                    "primary_class_cd_desc": None,
                    "difficulty": None
                }

            # Append attributes
            target[uid]["score_band_range_cd"] = q["score_band_range_cd"]
            target[uid]["skill_desc"] = q["skill_desc"]
            target[uid]["primary_class_cd_desc"] = q["primary_class_cd_desc"]
            target[uid]["difficulty"] = q["difficulty"]

    # Run for both reading + math
    enrich_for_questions(reading_questions_path)
    enrich_for_questions(math_questions_path)

    # Save back safely
    with open(math_mcq_responses_path, "w") as f:
        json.dump(math_mcq, f, indent=2)
    with open(math_spr_responses_path, "w") as f:
        json.dump(math_spr, f, indent=2)
    with open(reading_responses_path, "w") as f:
        json.dump(reading_mcq, f, indent=2)

def get_user_metrics(uid, id_token):
    headers = {"Authorization": f"Bearer {id_token}"}
    url = f"{BASE_URL}/users/{uid}?key={FIREBASE_API}"
    res = requests.get(url, headers=headers)
    if res.status_code != 200:
        print(f"❌ Firestore fetch failed: {res.status_code} {res.text}")
        return None
    fields = res.json().get("fields", {})
    def extract(map_field):
        return {
            k: float(v.get("doubleValue", 0))
            for k, v in map_field.get("mapValue", {}).get("fields", {}).items()
        }
    data = {
        "math_accuracy": float(fields.get("math_accuracy", {}).get("doubleValue", 0)),
        "reading_accuracy": float(fields.get("reading_accuracy", {}).get("doubleValue", 0)),
        "math_areas": extract(fields.get("math_areas", {})),
        "reading_areas": extract(fields.get("reading_areas", {})),
    }
    return data


#upload_to_firestore("server/questions/reading_mcq.json", "reading")
#093a41fa-36ba-4d68-a521-381fa328114e
#1bb7a34b-25ee-424c-9660-49795d60cc62
#19798572-a5c5-418c-b388-f78d1d9d16ed
#20c3df3f-382e-4c94-a9fe-cb25acbae6b1
#33508a17-8255-4313-80e7-c1bf9cd505b3
#34aff872-b9cb-4ea2-bfc3-bffd45b4eefb
#38f9b682-b22b-4740-ad52-2d8ba39ce79f
#423d623f-dd7e-4f6a-9347-2f37658b386f
#45041aa1-3b43-4378-97ad-ccf713c24c98
#476f7e8b-5191-4fec-b811-5afc910ecdb4
#4e4b82e7-8b5f-48a9-a90b-9ad75b202160
#8b422b91-e8e0-4fa8-9042-bde638fd7c71
#90748ee0-e643-48d5-b69f-c05398fbe6c2
#991b3543-dbb0-4575-8350-3e8c356e4a9e
#a6385b4b-b8cf-418b-9278-2c54d29bf323
#b6d4bce3-8116-47fb-b1b0-c00c57d1baa4
#b80c213c-8656-44b1-b75e-ecd8bccf950b
#c1d02e34-acbf-4155-a75e-ae2836ed61e6
#c3016e8a-ac88-442b-a6fb-5d7c38fd985d
#cb982f50-8fbc-48cf-b8f7-e644b13968a6
#d918a65d-69b8-4171-a9fa-7eba150b53c2
#e11b0a7d-989c-47e2-9ffa-1dcc9e9ed0e3
#f46e5ae7-df68-4fff-9fed-f7c1c9be6f1c
#fd1938e8-849e-4140-a2f3-69ab96635439