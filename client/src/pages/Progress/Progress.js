import React, { useEffect, useState } from "react";
import "./Progress.css";

export default function Progress() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch user data from backend (replace endpoint with yours)
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("userToken");

    const fetchUserProgress = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:5000/api/get_user_data?uid=${user.uid}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUserData(data);
      } catch (err) {
        console.error("Error fetching user progress:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProgress();
  }, []);

  if (loading)
    return (
      <div className="progress-loading">
        <div className="spinner"></div>
        <p>Loading your progress...</p>
      </div>
    );

  if (!userData)
    return (
      <div className="progress-error">
        <p>❌ Could not load progress data</p>
      </div>
    );

  const mathAreas = userData.math_areas || {};
  const readingAreas = userData.reading_areas || {};

  return (
    <div className="progress-container">
      <h1 className="progress-title">Your Progress</h1>

      {/* Subject Overview */}
      <div className="progress-summary">
        <div className="summary-card">
          <h2>📘 Math</h2>
          <p className="accuracy">{Math.round(userData.math_accuracy * 100)}%</p>
        </div>
        <div className="summary-card">
          <h2>📗 Reading</h2>
          <p className="accuracy">{Math.round(userData.reading_accuracy * 100)}%</p>
        </div>
      </div>

      {/* Math Area Breakdown */}
      <h3 className="section-header">Math Breakdown</h3>
      <div className="progress-section">
        {Object.entries(mathAreas).map(([area, acc]) => (
          <div key={area} className="progress-bar-row">
            <span className="bar-label">{area.replaceAll("_", " ")}</span>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${acc * 100}%`, backgroundColor: "#00E0FF" }}
              ></div>
            </div>
            <span className="bar-percent">{Math.round(acc * 100)}%</span>
          </div>
        ))}
      </div>

      {/* Reading Area Breakdown */}
      <h3 className="section-header">Reading Breakdown</h3>
      <div className="progress-section">
        {Object.entries(readingAreas).map(([area, acc]) => (
          <div key={area} className="progress-bar-row">
            <span className="bar-label">{area.replaceAll("_", " ")}</span>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${acc * 100}%`, backgroundColor: "#7CFF7C" }}
              ></div>
            </div>
            <span className="bar-percent">{Math.round(acc * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}