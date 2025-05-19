import React from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";

const LoginPage = ({ setToken }) => {
  const navigate = useNavigate();

  const handleLoginSuccess = (token) => {
    localStorage.setItem("token", token);
    setToken(token);
    navigate("/"); // ✅ 成功登入後導向 Dashboard
  };

  return (
    <div>
      <h1>Login</h1>
      <LoginForm setToken={handleLoginSuccess} />
    </div>
  );
};

export default LoginPage;
