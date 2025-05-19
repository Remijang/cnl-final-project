import React from "react";
import LoginForm from "../components/LoginForm";

const LoginPage = ({ setToken }) => {
  return (
    <div>
      <h1>Login</h1>
      <LoginForm setToken={setToken} />
    </div>
  );
};

export default LoginPage;
