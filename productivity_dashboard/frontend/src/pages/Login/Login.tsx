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
            return;
        }
        console.log("Login successful, redirecting...");
        navigate('/dashboard');
    };

    return (
        <div className='login'>
            <div className="login-wrapper">
                <div className="login-left">
                    <h3 className="login-logo">TaskMaster</h3>
                    <span className="login-desc">
                        Master your workflow boost productivity.
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
                            required
                        />
                        <input
                            type="password"
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            placeholder="Password"
                            className="login-input"
                            required
                        />
                        <button className="login-button" onClick={handleSubmit}>Log In</button>
                        <span className="login-forgot">Forgot Password?</span>
                        <hr style={{ border: '0.5px solid #333', width: '100%' }} />
                        <button className="login-register" onClick={() => navigate('/signin')}>
                            Join Now
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
};

