import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import OAuthRedirect from "./components/OAuthRedirect";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { fetchCalendars } from "./services/api";

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/login" element={<LoginPage setToken={setToken} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/oauth" element={<OAuthRedirect setToken={setToken} />} />
      </Routes>
    </Router>
  );
};

export default App;
