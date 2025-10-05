import './App.css';
import HomePage from './pages/HomePage/HomePage';
import Login from './pages/Login/Login';
import SignUp from './pages/SignUp/SignUp';
import Dashboard from './pages/Dashboard/Dashboard';
import { UserProvider } from "./context/UserContext";
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PickPractice from './pages/Practice/PickPractice';
import Practice from './pages/Practice/Practice';
import Progress from './pages/Progress/Progress';

function App() {
  const [user, setUser] = useState(null);
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/pick-practice" element={<PickPractice />} />
          <Route path="/practice/:subject/:area/:difficulty/:type" element={<Practice />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path='/progress' element={<Progress/>} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
