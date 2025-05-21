import React, { useEffect, useState } from "react";
import { getUserCalendar } from "../services/calendarService";
import CalendarList from "../components/CalendarList";
import EventManager from "../components/EventManager";
import LoginForm from "../components/LoginForm";

const DashboardPage = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [calendars, setCalendars] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getUserCalendar(token);
        setCalendars(data);
      } catch (err) {
        console.error(err);
      }
    };
    if (token) load();
  }, [token]);

  return (
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
  );
};

export default DashboardPage;
