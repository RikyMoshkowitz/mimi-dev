import React, { useState } from "react";
import { loginEmployee } from "../api/api";
import { useNavigate } from "react-router-dom";
import "./Login.css"; // ייבוא קובץ העיצוב

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const employeeId = localStorage.getItem("employee_id");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await loginEmployee({ email, password });
            // Store the access token and employee ID in localStorage
            localStorage.setItem("token", response.access_token);
            localStorage.setItem("employee_id", response.employee_id); // Store employee_id
            navigate("/mainPage");
        } catch (err) {
            setError("Invalid email or password.");
        }
    };

    return (
        <div className="login-container">
          <div className="login-box">

            <form className= "login-form"onSubmit={handleSubmit}>
                <div className="form-field">
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                {error && <p style={{ color: "red" }}>{error}</p>}
                <button type="submit">Login</button>
            </form>
            </div>
            </div>
        );
};

export default Login;
