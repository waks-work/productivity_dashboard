import React, { useState } from "react";
import "./Login.css"
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from 'react-router-dom';
import ApiService from "../../services/ApiService";

export const SignInForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password && (password !== confirmPassword)) {
            alert("Ensure all you fields are filled and password match ");
            return;
        }

        const success = await register(email, password);
        if (success) {
            console.log("Registration successful...");
            navigate('/login');
        }
    };

    return (
        <div className='login'>
            <div className="login-wrapper">
                <div className="login-left">
                    <h3 className="login-logo">TaskMaster</h3>
                    <span className="login-desc">
                        Join mordern teams and individual exellence.
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

                        <div>
                            <span className="login-input-name">Enter your password:</span>
                            <input
                                type="password"
                                onChange={(e) => setPassword(e.target.value)}
                                value={password}
                                placeholder="Min 8 characters..."
                                style={{ width: '90%' }}
                                className="login-input"
                                required
                            />
                        </div>

                        <div>
                            <span className="login-input-name">Confirm your password:</span>
                            <input
                                type="password"
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                value={confirmPassword}
                                style={{ width: '90%' }}
                                placeholder="Password..."
                                className="login-input"
                            />
                        </div>

                        <button className="login-button" onClick={handleSubmit}>Sign In</button>
                        <span className="login-forgot" onClick={() => navigate('/login')}>Already have an account?</span>

                        <hr style={{ border: '0.5px solid #333', margin: '10px 0' }} />
                        <button className="login-register">
                            Log In
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
};
