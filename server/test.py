import json

def get_unique_primary_class_cd_desc(filename):
    with open(filename, 'r') as f:
        data = json.load(f)
    return set(item.get('primary_class_cd_desc') for item in data if 'primary_class_cd_desc' in item)

reading_file = 'server/questions/reading_questions.sorted.json'
math_file = 'server/questions/math_questions_sorted.json'

reading_unique = get_unique_primary_class_cd_desc(reading_file)
math_unique = get_unique_primary_class_cd_desc(math_file)

print(f"Reading: {len(reading_unique)} unique values")
print("Reading values:", reading_unique)
print(f"Math: {len(math_unique)} unique values")
print("Math values:", math_unique)