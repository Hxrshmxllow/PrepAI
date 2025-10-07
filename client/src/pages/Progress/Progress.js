import React, { useEffect, useState } from "react";
import "./Progress.css";
import Navbar from "../../components/Navbar/Navbar";

export default function Progress() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("userToken");

    const fetchUserProgress = async () => {
      try {
        const res = await fetch(
          `http://127.0.0.1:5000/api/get_user_data?uid=${user.uid}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
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
        <p>Could not load progress data</p>
      </div>
    );

  const mathAreas = userData.math_areas || {};
  const readingAreas = userData.reading_areas || {};

  return (
    <div className="progress-page">
      <Navbar />
      <div className="progress-content">
        <div className="progress-container">
          <h1 className="progress-title">Your Progress Overview</h1>
          <p className="progress-subtitle">
            Track your performance across subjects and focus areas
          </p>
          <div className="subject-summary">
            <div className="subject-card">
              <h2>Math</h2>
              <p className="subject-accuracy">
                {Math.round(userData.math_accuracy * 100)}%
              </p>
              <span className="subject-label">Overall Accuracy</span>
            </div>
            <div className="subject-card">
              <h2>Reading & Writing</h2>
              <p className="subject-accuracy">
                {Math.round(userData.reading_accuracy * 100)}%
              </p>
              <span className="subject-label">Overall Accuracy</span>
            </div>
          </div>
          <div className="progress-section">
            <h3>Math Breakdown</h3>
            {Object.entries(mathAreas).map(([area, acc]) => (
              <div key={area} className="progress-bar-row">
                <span className="bar-label">{area.replaceAll("_", " ")}</span>
                <div className="progress-bar">
                  <div
                    className="progress-fill math"
                    style={{ width: `${acc * 100}%` }}
                  ></div>
                </div>
                <span className="bar-percent">{Math.round(acc * 100)}%</span>
              </div>
            ))}
          </div>
          <div className="progress-section">
            <h3>Reading & Writing Breakdown</h3>
            {Object.entries(readingAreas).map(([area, acc]) => (
              <div key={area} className="progress-bar-row">
                <span className="bar-label">{area.replaceAll("_", " ")}</span>
                <div className="progress-bar">
                  <div
                    className="progress-fill reading"
                    style={{ width: `${acc * 100}%` }}
                  ></div>
                </div>
                <span className="bar-percent">{Math.round(acc * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
