import React, { useState } from "react";
import { login } from "../services/authService";
import { Link, useNavigate } from "react-router-dom";

const LoginForm = ({ setToken }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" }); // State for custom messages
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" }); // Clear previous messages
    try {
      const result = await login({ email, password });
      const token = result.token;
      localStorage.setItem("token", token);
      setToken(token);
      setMessage({ type: "success", text: "Login successfully！" });
      setTimeout(() => navigate("/calendar/"), 500);
    } catch (err) {
      console.error("Login failed", err);
      setMessage({ type: "error", text: "Login failed：" + err.message });
    }
  };

  return (
    <div className="p-6">
      {/* Message Box */}
      {message.text && (
        <div
          className={`p-3 mb-4 rounded-md text-sm text-center ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
          role="alert"
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="sr-only">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          />
        </div>
        <div>
          <label htmlFor="login-password" className="sr-only">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Login
        </button>
      </form>

      <p className="text-center text-gray-600 mt-6">
        Not registered?{" "}
        <Link to="/register">
          <button
            type="button"
            className="text-blue-600 hover:text-blue-800 font-semibold ml-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
          >
            Go to register
          </button>
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;
