import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import OAuthRedirect from "./components/OAuthRedirect";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { fetchCalendars } from "./services/api";

const App = () => {
  /*
  const [calendars, setCalendars] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  useEffect(() => {
    const loadCalendars = async () => {
      try {
        const data = await fetchCalendars(token);  // ⬅️ 取得資料
        setCalendars(data);                        // ⬅️ 更新 state
      } catch (err) {
        console.error("Failed to load calendars:", err);
      }
    };

    if (token) {
      loadCalendars();
    }
  }, [token]);
  
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div>
              <h1>My Calendars</h1>
              {!token ? (
                <LoginPage setToken={setToken} />
              ) : (
                <>
                  <CalendarList calendars={calendars} />
                  <EventManager token={token} />
                </>
              )}
            </div>
          }
        />
        <Route path="/oauth" element={<OAuthRedirect setToken={setToken} />} />
      </Routes>
    </Router>
  );
  */
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/oauth" element={<OAuthRedirect />} />
      </Routes>
    </Router>
  );
};

export default App;
