import React, { useState } from "react";
import "./Login.css"
import { useAuth } from "../../hooks/useAuth";

export const SignInForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Password do not match retry again");
      return;
    }
    if (!email || !password) {
      alert("Please fill in both feilds.");
      return;
    }

    const success = await register(email, password);
    if (success) {
      console.log("Registration successful...");
    }
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

            <span className="login-input-name">Enter your password:</span>
            <input
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              placeholder="Password"
              className="login-input"
            />

            <span className="login-input-name">Confirm your password:</span>
            <input
              type="password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              value={confirmPassword}
              placeholder="Password"
              className="login-input"
            />
            <button className="login-button" onClick={handleSubmit}>Sign In</button>
            <span className="login-forgot">Already have an account?</span>
            <button className="login-register">
              Login to your account
            </button>
          </div>
        </div>

      </div>
    </div>
  )
};
