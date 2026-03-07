import React, { useState } from "react";
import { useNavigate } from 'react-router-dom'
import "./Login.css"
import { useAuth } from "../../hooks/useAuth";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Please fill in both feilds.");
      return;
    }

    const success = await login(email, password);
    if (!success) {
      alert("Invalid credentials. Please try again.");
    }
    console.log("Login successful, redirecting...");
    navigate('/dashboard');
  };

  return (
    <div className='login'>
      <div className="login-wrapper">
        <div className="login-left">
          <h3 className="login-logo">Productivity</h3>
          <span className="login-desc">
            Let us be more productive together.
          </span>
        </div>

        <div className="login-right">
          <div className="login-box">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
            />
            <input
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              placeholder="Password"
              className="login-input"
            />
            <button className="login-button" onClick={handleSubmit}>Log In</button>
            <span className="login-forgot">Forgot Password?</span>
            <button className="login-register">
              Create a new account
            </button>
          </div>
        </div>

      </div>
    </div>
  )
};

