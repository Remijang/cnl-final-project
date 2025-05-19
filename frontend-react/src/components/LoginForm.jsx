import React, { useState } from "react";
import { login } from "../services/authService";
import { Link } from "react-router-dom"; // 加這行

const LoginForm = ({ setToken }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await login({ email, password });
      localStorage.setItem("token", token);
      setToken(token);
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
      </form>

      {/* 註冊連結按鈕 */}
      <p style={{ marginTop: "1em" }}>
        還沒有帳號嗎？{" "}
        <Link to="/register">
          <button type="button">前往註冊</button>
        </Link>
      </p>
    </>
  );
};

export default LoginForm;
