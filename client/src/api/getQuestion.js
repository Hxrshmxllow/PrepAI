export async function fetchQuestion(subject, area, difficulty, type, userToken) {
  const res = await fetch(
    `http://127.0.0.1:5000/api/get_question?subject=${subject}&area=${area}&difficulty=${difficulty}&type=${type}&userToken=${userToken}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch question");
  }

  const data = await res.json();
  return data; 
}

export async function fetchAIQuestion(subject, area, difficulty, type, userToken) {
  const res = await fetch(
    `http://127.0.0.1:5000/api/get_question_ai?subject=${subject}&area=${area}&difficulty=${difficulty}&type=${type}&userToken=${userToken}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch question");
  }

  const data = await res.json();
  return data; 
}