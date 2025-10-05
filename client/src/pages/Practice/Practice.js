import './Practice.css';
import Navbar from "../../components/Navbar/Navbar";
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams} from 'react-router-dom';
import { useUser } from "../../context/UserContext";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import Calculator from '../../components/Calculator/Calculator';
import { fetchQuestion, fetchAIQuestion } from "../../api/getQuestion";  
import { defaultQuestion } from "../../models/Question"

function Practice() {
  const navigate = useNavigate();
  const location = useLocation();
  const { practiceType } = location.state || { practiceType: "full" };
  const [initialLoading, setInitialLoading] = useState(true);
  const { user, setUser } = useUser();
  const [question, setQuestion] = useState(defaultQuestion);
  const [loading, setLoading] = useState(true);
  const [answerIsCorrect, setAnswerIsCorrect] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [stimulus, setStimulus] = useState(false);
  const { subject, area, difficulty, type } = useParams();
  const queryParams = new URLSearchParams(location.search);
  const aiMode = queryParams.get("ai") === "true";
  const auth = getAuth();
  const provider = new GoogleAuthProvider();

  const loadQuestion = async () => {
    try {
      if (initialLoading) setLoading(true);
        setStimulus(false);
        const userToken = user ? localStorage.getItem("userToken") : null;
        if(!userToken){
          navigate("/login")
        }
        else{
          
          let data;
          alert(aiMode);
          if (aiMode) {
            data = await fetchAIQuestion(subject, area, difficulty, type, userToken);
          } else {
            data = await fetchQuestion(subject, area, difficulty, type, userToken);
          }
        
          let combinedContent = data.stem || "";
          if (data.stimulus) {
            combinedContent = `${data.stimulus}<br/>${data.stem}`;
            setStimulus(true);
          }
          setQuestion({
            ...data,
            combinedContent: data.stimulus
              ? `${data.stimulus}<br/>${data.stem}`
              : data.stem,
          });
          setAnswerIsCorrect(null);
          setSelectedAnswer("");
        } 
      }
    catch (err) {
        alert("❌ Error fetching data:", err);
      } finally {
        if (initialLoading) {
          setLoading(false);
          setInitialLoading(false);
        }

      }
  };
  useEffect(() => {
    loadQuestion();
  }, [practiceType]);


  const checkAnswer = async () => {
    if (!selectedAnswer) {
      alert("Please select an answer.");
      return;
    }
    setAnswerIsCorrect(
      selectedAnswer.trim().replace(",", "") ===
      question.correct_answer.replace("","", "")
    );
    
    const userToken = user ? localStorage.getItem("userToken") : null;

    if (userToken) {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/log_question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: userToken,
            user_id: user.uid,
            question: question,
            isCorrect: selectedAnswer.trim().replace(",", "") ===
      question.correct_answer.replace("","", "")
          }),
        });

        const data = await res.json();
        console.log("Progress saved:", data);
      } catch (err) {
        console.error("Error saving progress:", err);
      }
    }
  };

  const nextQuestion = () => {
    setAnswerIsCorrect(null);
    setSelectedAnswer("");
    loadQuestion();
  };

  if (loading)
  return (
    <div className="loading-container">
      <h2 className="glow-text">Loading Practice Session...</h2>
    </div>
  );

    return (
        <div className="practice-container-div">
            <Navbar />
            <div className="practice-center-div">
                <div className="practice-card" style={{ gridTemplateColumns: question.stimulus ? "1fr 0fr" : "1fr 1fr" }}>
                    <div className="left-col" >
                        <div className="meta-row">
                            <span className="badge">Easy</span>
                            <div className="spacer" />
                            <div className="nav-buttons">
                            <div className="time-icon" aria-label="time">3:59</div>
                            <button className="icon-btn" aria-label="reference">Ref</button>
                            <button className="icon-btn" aria-label="finish practice">Exit</button>
                            </div>
                        </div>

                        <div className="question-block">
                            <div
                                className="question-stem"
                                aria-label="question"
                                dangerouslySetInnerHTML={{ __html: question.combinedContent || "No content available" }}
                                />

                           <form className="choices" aria-label="answer choices">
                            {question.type === "mcq" ? (
                                ["A", "B", "C", "D"].map((letter, index) => (
                                <label
                                    key={letter}
                                    className="choice"
                                    style={
                                    answerIsCorrect !== null
                                        ? letter === question.correct_answer
                                        ? { background: "green" }
                                        : letter === selectedAnswer
                                        ? { background: "red" }
                                        : {}
                                        : {}
                                    }
                                >
                                    <input
                                    type="radio"
                                    name="answer"
                                    value={letter}
                                    checked={selectedAnswer === letter}
                                    onChange={() => setSelectedAnswer(letter)}
                                    style={{ display: "none" }}
                                    />
                                    <span
                                    className="choice-letter"
                                    style={{
                                        display: "inline-block",
                                        width: "32px",
                                        height: "32px",
                                        lineHeight: "32px",
                                        textAlign: "center",
                                        border: "1px solid #ccc",
                                        borderRadius: "50%",
                                        cursor: "pointer",
                                        backgroundColor:
                                        answerIsCorrect !== null
                                            ? letter === question.correct_answer
                                            ? "green"
                                            : letter === selectedAnswer
                                            ? "red"
                                            : "transparent"
                                            : selectedAnswer === letter
                                            ? "#007bff"
                                            : "transparent",
                                        color: selectedAnswer === letter ? "white" : "black",
                                        userSelect: "none",
                                    }}
                                    >
                                    {letter}
                                    </span>
                                    <span
                                    className="choice-text"
                                    dangerouslySetInnerHTML={{ __html: question.answerOptions[index]?.content || "" }}
                                    style={
                                        answerIsCorrect !== null
                                        ? letter === question.correct_answer
                                            ? { color: "white" }
                                            : letter === question.correct_answer
                                            ? { color: "white" }
                                            : {}
                                        : {}
                                    }
                                    />
                                </label>
                                ))
                            ) : (
                                <input
                                    type="number"
                                    className="numeric-input"
                                    value={selectedAnswer || ""}
                                    onChange={(e) => setSelectedAnswer(e.target.value)}
                                    style={{
                                        padding: "8px",
                                        border: "1px solid #ccc",
                                        borderRadius: "4px",
                                        width: "100%",
                                        marginTop: "8px",
                                    }}
                                    placeholder="Enter your answer"
                                />
                            )}
                            </form>

                            <div className="check-row">
                                <button className="check-btn" type="button" onClick={checkAnswer} style={{ display: answerIsCorrect === null ? "block" : "none" }}>CHECK</button>
                                 <button className="check-btn" type="button" onClick={nextQuestion} style={{ display: answerIsCorrect === null ? "none" : "block" }}>Next</button>
                            </div>
                        </div>
                        <div className="explanation" aria-live="polite" aria-atomic="true" style={{ display: answerIsCorrect === null ? "none" : "block" }}>
                            {answerIsCorrect === true && <p style={{ color: "green" }}>Correct! Well done.</p>}
                            {answerIsCorrect === false && <p style={{ color: "red" }} dangerouslySetInnerHTML={{ __html: question.rationale }}></p>}
                        </div>
                    </div>


                    {!stimulus && (
                        <div className="right-col" aria-hidden="false">
                           <Calculator />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Practice;