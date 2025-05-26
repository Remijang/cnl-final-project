import React, { useState } from "react";
import { login } from "../services/authService";
import { Link } from "react-router-dom"; // 加這行
import "../css/Register.css";

const LoginForm = ({ setToken }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await login({ email, password });
      const token = result.token;
      localStorage.setItem("token", token);
      setToken(token);
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="form-input"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="form-input"
        />
        <button type="submit" className="register-button">
          Login
        </button>
      </form>

      {/* 註冊連結按鈕 */}
      <p className="login-prompt">
        還沒有帳號嗎？{" "}
        <Link to="/register">
          <button type="button" className="login-link">
            前往註冊
          </button>
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;
