import '../HomePage/HomePage.css';
import Navbar from "../../components/Navbar/Navbar";
import React, { useState, useEffect, useRef} from "react";
import { useNavigate } from 'react-router-dom';
import Illustration from "../../assets/score-improvement-illustration.png";

function HomePage() {
    const navigate = useNavigate();
    return(
        <div className="home-container-div">
            <Navbar />
            <div className="home-center-div">
                <h1 className="home-heading">Welcome to PrepAI</h1>
                <p className="home-subheading">Level up your digital SAT® prep with thousands of practice questions originally from CollegeBoard questionbank at your fingertips.</p>
                <div className="home-buttons-div">
                    <button className="get-started-button" onClick={() => navigate('/sign-up')}>Get Started</button>
                    <button className="learn-more-button" onClick={() =>navigate('/pick-practice')}>Practice</button>
                </div>
                <img src={Illustration} alt="PrepAI Illustration" className='illustration'/>
                <p className="home-footer-text">PrepAI is not affiliated with CollegeBoard. SAT® is a registered trademark of CollegeBoard, which was not involved in the production of, and does not endorse, this product.</p>
            </div>
        </div>
    );
}

export default HomePage;