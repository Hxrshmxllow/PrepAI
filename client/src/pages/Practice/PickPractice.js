import React, {useState} from 'react';
import './PickPractice.css';
import Navbar from '../../components/Navbar/Navbar';
import { useNavigate } from "react-router-dom";

function PickPractice() {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [aiMode, setAiMode] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const areas = {
    math: [
      "Algebra",
      "Geometry_and_Trigonometry",
      "Advanced_Math",
      "Problem-Solving_and_Data_Analysis",
    ],
    reading: [
      "Craft_and_Structure",
      "Expression_of_Ideas",
      "Information_and_Ideas",
      "Standard_English_Conventions",
    ],
  };

  const difficulties = ["Easy", "Medium", "Hard"];

  const handleSubjectClick = (subject) => {
    if (subject === "full") {
    handleStartPractice("full", null, null);
    } 
    else if(subject === "reading"){
      setSelectedSubject(subject);
      setSelectedArea(null);
      setSelectedType("mcq"); 
    }
    else {
      setSelectedSubject(subject);
      setSelectedArea(null);
      setSelectedType(null); 
    }
  };

  const handleAreaClick = (area) => {
    setSelectedArea(area);
  };

  const handleDifficultyClick = (difficulty) => {
    if(difficulty === "Easy"){
      difficulty = "E";
    }
    else if(difficulty === "Medium"){
      difficulty = "M";
    }
    else{
      difficulty = "H";
    }
    handleStartPractice(selectedSubject, selectedArea, difficulty.toLowerCase(), aiMode, selectedType);
  };

  const handleStartPractice = (subject, area, difficulty, aiMode, type) => {
    navigate(`/practice/${subject}/${area}/${difficulty}/${type}?ai=${aiMode}`);
  };
    const navigate = useNavigate();
    const handleChoice = (type) => {
        navigate("/practice", { state: { practiceType: type } });
    };
  return (
    <div className="pick-practice-container-div">
        <Navbar />
        <h1 className="practice-page-title">Pick Your Practice</h1>
        <p className="practice-page-subtitle">Choose a section to start practicing</p>
        <div className="pick-practice-container">
      <h1 className="pick-title">Choose Your Practice</h1>
      {!selectedSubject && (
        <div className="choice-grid fade-in">
          <button className="practice-choice-btn" onClick={() => handleSubjectClick("full")}>
            Full Practice Test
          </button>
          <button className="practice-choice-btn" onClick={() => handleSubjectClick("math")}>
            Math
          </button>
          <button className="practice-choice-btn" onClick={() => handleSubjectClick("reading")}>
            Reading
          </button>
        </div>
      )}
      {selectedSubject === "math" && !selectedType && (
        <div className="fade-in">
          <h2 className="pick-subtitle">Select Question Type</h2>
          <div className="choice-grid">
            <button className="practice-choice-btn" onClick={() => setSelectedType("mcq")}>
              Multiple Choice (MCQ)
            </button>
            <button className="practice-choice-btn" onClick={() => setSelectedType("spr")}>
              Open Ended (SPR)
            </button>
          </div>
          <button className="back-btn" onClick={() => setSelectedSubject(null)}>← Back</button>
        </div>
      )}
      {selectedSubject &&
  ((selectedSubject === "math" && selectedType) || selectedSubject === "reading") &&
  !selectedArea && (
        <div className="fade-in">
          <h2 className="pick-subtitle">{selectedSubject.toUpperCase()} Areas</h2>
          <div className="choice-grid">
            {areas[selectedSubject].map((area) => (
              <button key={area} className="practice-choice-btn" onClick={() => handleAreaClick(area)}>
                {area.replaceAll("_", " ")}
              </button>
            ))}
          </div>
          <button className="back-btn" onClick={() => setSelectedSubject(null)}>← Back</button>
        </div>
      )}
      {selectedArea && (
        <div className="fade-in">
          <h2 className="pick-subtitle">
            {selectedArea.replaceAll("_", " ")} ({selectedSubject})
          </h2>

          <div className="ai-toggle">
            <label className="ai-checkbox">
              <input
                type="checkbox"
                checked={aiMode}
                onChange={(e) => setAiMode(e.target.checked)}
              />
              <span className="checkmark"></span>
              AI Mode
            </label>
          </div>
          <div className="choice-grid">
            {difficulties.map((diff) => (
              <button
                key={diff}
                className="practice-choice-btn"
                onClick={() => handleDifficultyClick(diff)}
              >
                {diff}
              </button>
            ))}
          </div>
          <button className="back-btn" onClick={() => setSelectedArea(null)}>← Back</button>
        </div>
      )}
    </div>
    </div>
  );
}

export default PickPractice;