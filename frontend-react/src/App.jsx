import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CalendarList from "./components/CalendarList";
import LoginForm from "./components/LoginForm";
import OAuthRedirect from "./components/OAuthRedirect";
import EventManager from "./components/EventManager";

const App = () => {
  const [calendars, setCalendars] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  const fetchCalendars = () => {
    fetch("http://localhost:3000/api/calendars/1", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setCalendars(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    if (token) fetchCalendars();
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
                <LoginForm setToken={setToken} />
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
};

export default App;
