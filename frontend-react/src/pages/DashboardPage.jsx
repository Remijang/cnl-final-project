import React, { useEffect, useState } from "react";
import { getUserCalendar, createCalendar } from "../services/calendarService";
import CalendarList from "../components/CalendarList";
import EventManager from "../components/EventManager";
import LoginForm from "../components/LoginForm";
import CalendarEditor from "../components/CalendarEditor";
import { toggleVisibility } from "../services/permissionService";

const DashboardPage = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [calendars, setCalendars] = useState([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState(null);

  const loadCalendars = async () => {
    try {
      const data = await getUserCalendar(token);
      setCalendars(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) loadCalendars();
  }, [token]);

  const handleSelectCalendar = (id) => {
    setSelectedCalendarId(id);
  };

  const handleCreateCalendar = async ({ title, shared }) => {
    try {
      const newCalendar = await createCalendar(token, {title});
      if (shared) {
        console.log("new calender id: ", newCalendar.id)
        await toggleVisibility(token, newCalendar.id, true); // ⬅️ 透過 API 開啟公開權限
      }
      await loadCalendars(); // 更新列表
    } catch (err) {
      console.error("Create calendar failed", err);
    }
  };

  return (
    <div>
      <h1>My Calendars</h1>
      {!token ? (
        <LoginForm setToken={setToken} />
      ) : (
        <>
          <CalendarList calendars={calendars} onSelect={handleSelectCalendar} />
          <h3>Create New Calendar</h3>
          <CalendarEditor onSave={handleCreateCalendar} />
          {selectedCalendarId && (
            <>
              <h3>
                Events in Calendar:{" "}
                {
                  calendars.find((cal) => cal.id === selectedCalendarId)?.title ||
                  `(ID: ${selectedCalendarId})`
                }
              </h3>

              <EventManager token={token} calendarId={selectedCalendarId} />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default DashboardPage;
