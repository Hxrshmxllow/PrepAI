import '../Navbar/Navbar.css';
import Logo from "../../assets/logo.png";
import { useNavigate } from 'react-router-dom';
import { useUser } from "../../context/UserContext";
import { useState, useRef, useEffect } from "react";

function Navbar() {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login");
  };
  return (
    <div className="navbar">
        <img src={Logo} alt="PrepAI Logo" className='logo' onClick={() => navigate('/')}/>
        <div className="nav-links-div">
            <a href="/dashboard" className="nav-link" onClick={() => navigate('/dashboard')}>Dashboard</a>
            <div>
                {user ? (
                  <div className="avatar-container" ref={dropdownRef}>
                    <img
                      src={user.picture}
                      alt={user.name || "User"}
                      className="user-avatar"
                      onClick={() => setOpen(!open)}
                    />
                    <div className={`dropdown-menu ${open ? "show" : ""}`}>
                      <button onClick={() => navigate("/settings")}>Settings</button>
                      <button onClick={handleLogout}>Logout</button>
                    </div>
                </div>
              ) : (
                <button
                  className="login-button"
                  onClick={() => navigate("/login")}
                >
                  Login
                </button>
              )}
          </div>
        </div>
    </div>  
  );
}

export default Navbar;