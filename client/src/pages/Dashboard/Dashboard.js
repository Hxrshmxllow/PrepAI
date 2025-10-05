import '../Dashboard/Dashboard.css';
import Navbar from "../../components/Navbar/Navbar";
import React, { useState, useEffect, useRef} from "react";
import { useNavigate } from 'react-router-dom';
import { useUser } from "../../context/UserContext";


function Dashboard() {
    const navigate = useNavigate();
    const { user, setUser } = useUser();
    return(
        <div className="dashboard-container">
        <Navbar />

        <div className="dashboard-body">
            <main className="main-content">
            <h1 className="main-heading">
                Welcome back{user?.name ? `, ${user.name}` : ""}
            </h1>

            <div className="cards">
                <div className="card">
                <h3>Start Practice</h3>
                <p>Pick a section and begin practicing questions.</p>
                <button className="btn blue" onClick={() => navigate("/pick-practice")}>Practice Now</button>
                </div>

                <div className="card">
                <h3>Progress Tracker</h3>
                <p>See your accuracy and improvement over time.</p>
                <button className="btn green" onClick={() => navigate("/progress")}>View Progress</button>
                </div>

                <div className="card">
                <h3>Upcoming Goals</h3>
                <p>Stay on track with your personalized SAT study plan.</p>
                <button className="btn purple">View Goals</button>
                </div>
            </div>
            </main>
        </div>
    </div>
    );
}

export default Dashboard;