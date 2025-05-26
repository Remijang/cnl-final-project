import React, { useState } from "react";
import { register } from "../services/authService";
import { useNavigate } from "react-router-dom";
import "../css/Register.css";

const RegisterForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register({ name, email, password });
      alert("註冊成功，請登入");
      navigate("/login");
    } catch (err) {
      console.error("註冊失敗", err);
      alert("註冊失敗：" + err.message);
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="使用者名稱"
          required
          className="form-input"
        />
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
          Register
        </button>
      </form>

      <p className="login-prompt">
        已經有帳號？
        <button onClick={() => navigate("/login")} className="login-link">
          返回登入
        </button>
      </p>
    </div>
  );
};

export default RegisterForm;
