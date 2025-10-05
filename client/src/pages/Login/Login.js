import '../Login/Login.css';
import Navbar from "../../components/Navbar/Navbar";
import React, { useState } from 'react';   
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from 'react-router-dom';
import { MdErrorOutline } from "react-icons/md";
import { auth, provider } from "../../firebase";  
import { signInWithPopup } from "firebase/auth";
import { useUser } from "../../context/UserContext";

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState(null);
    const [password, setPassword] = useState(null);
    const [validEmail, setValidEmail] = useState(true);
    const [validPassword, setValidPassword] = useState(true);
    const [validCredentials, setValidCredentials] = useState(true);
    const { user, setUser } = useUser();
    const sign_in = (e) => {
        e.preventDefault();
        if (!email || !email.includes('@')) {
            setValidEmail(false);
            return;
        }
        if (!password) {
            setValidPassword(false);
            return;
        }
        if (email === "         " && password === "          ") {
            navigate('/dashboard');
        } else {
            setValidCredentials(false);
        }
    }
    const signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const token = await result.user.getIdToken(); 
            localStorage.setItem("userToken", token);
            const res = await fetch("http://127.0.0.1:5000/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (data.user) {
            setUser(data.user);  
            navigate("/dashboard");
        } else {
            alert("Login failed: no user returned");
        }
        } 
        catch (error) {
            alert("Google login error:", error);
        }
    };
    return (
        <div className="login-container-div">
            <Navbar />
            <div className='login-page-container'>
                <h1 className='log-into-spotify-text'>Log in to PrepAI</h1>
                <div className='log-into-providers-container' onClick={signInWithGoogle}>
                    <FcGoogle className='google-icon'></FcGoogle>
                    <h2 className='google-login-text'>Continue with Google</h2>
                </div>
                <div className='login-page-class-container'></div>
                <form className='login-page-form'>
                <div className='login-page-input-field-container' style={{ height: !validEmail ? "90px" : "50px" }}>
                    <label class="login-page-input-label" for="email">Email or username</label>
                    <input type="text" id="email" placeholder="Email or username" class="login-page-input-field" onChange={(e) => { setEmail(e.target.value); setValidEmail(true); setValidCredentials(true);}} style={{ borderColor: (!validEmail || !validCredentials) ? "red" : "gray" }} required/>
                    {!validEmail && (
                    <div className='bad-email-container'>
                        <MdErrorOutline className='error-icon'></MdErrorOutline>
                        <p>This email is invalid. Please try again.</p>
                    </div>
                    )}
                </div>
                <div className='login-page-input-field-container' style={{ height: !validPassword ? "90px" : "50px" }}>
                    <label class="login-page-input-label" for="password">Password</label>
                    <input type="text" id="password" placeholder="Password" class="login-page-input-field" onChange={(e) => { setPassword(e.target.value); setValidPassword(true); setValidCredentials(true);}} style={{ borderColor: (!validPassword || !validCredentials) ? "red" : "gray" }} required/>
                    {!validPassword && (
                    <div className='bad-email-container'>
                        <MdErrorOutline className='error-icon'></MdErrorOutline>
                        <p>Please enter a password</p>
                    </div>
                    )}
                </div>
                <button className='login-page-login-button' onClick={sign_in}>Log in</button>
                {!validCredentials && (
                    <div className='bad-email-container'>
                        <MdErrorOutline className='error-icon'></MdErrorOutline>
                        <p>The email or password is incorrect. Please try again.</p>
                    </div>
                )}
                </form>
                <h2 className='login-page-forgot-password-text'>Forgot your password?</h2>
                <div className='login-page-sign-up-container'>
                <h2 className='login-page-dont-have-text'>Don't have an account?</h2>
                <h2 className='login-page-sign-up-text' onClick={() => navigate('/sign-up')}>Sign up for PrepAI.</h2>
                </div>
            </div>   
        </div>  
    );
}

export default Login;