import React from "react";
import LoginForm from "../components/LoginForm";

const LoginPage = ({ setToken }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 hover:scale-105">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-8 tracking-tight">
          Welcome Back!
        </h1>
        {/* Pass the setToken function directly to LoginForm.
            LoginForm will handle setting the token in localStorage and updating the state. */}
        <LoginForm setToken={setToken} />
      </div>
    </div>
  );
};

export default LoginPage;
