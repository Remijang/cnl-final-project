import React from "react";
import RegisterForm from "../components/RegisterForm";

const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 hover:scale-105">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-8 tracking-tight">
          Create Your Account
        </h1>
        {/* The RegisterForm component will be rendered here */}
        <RegisterForm />
      </div>
    </div>
  );
};

export default RegisterPage;
