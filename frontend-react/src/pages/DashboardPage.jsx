import React, { useEffect, useState, useCallback } from "react";
import {
  getUserCalendar,
  getSubscribedCalendars,
  createCalendar,
} from "../services/calendarService";
import CalendarList from "../components/CalendarList";
import EventManager from "../components/EventManager";
import LoginForm from "../components/LoginForm";
import CalendarEditor from "../components/CalendarEditor";
import { toggleVisibility } from "../services/permissionService";
import SubscribedCalendarView from "../components/SubscribedCalendarView";
import MergedCalendar from "../components/MergedCalendar";

const DashboardPage = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [myCalendars, setMyCalendars] = useState([]);
  const [subscribedCalendars, setSubscribedCalendars] = useState([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState(null);
  const [subscribedOnly, setSubscribedOnly] = useState([]);
  const [viewMode, setViewMode] = useState("merged"); // "mine" or "subscribed"

  const loadCalendars = async () => {
    try {
      const [myCals, subCals] = await Promise.all([
        getUserCalendar(token),
        getSubscribedCalendars(token),
      ]);
      setMyCalendars(myCals);
      setSubscribedCalendars(subCals);
      const subOnly = subCals.filter(
        (sub) => !myCals.some((mine) => Number(mine.id) === Number(sub.id))
      );
      setSubscribedOnly(subOnly);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!token) return;

    const fetchAll = async () => {
      try {
        const [myCals, subCals] = await Promise.all([
          getUserCalendar(token),
          getSubscribedCalendars(token),
        ]);
        setMyCalendars(myCals);
        setSubscribedCalendars(subCals);
        const subOnly = subCals.filter(
          (sub) => !myCals.some((mine) => Number(mine.id) === Number(sub.id))
        );
        setSubscribedOnly(subOnly);
      } catch (err) {
        console.error("Fetch failed", err);
      }
    };

    fetchAll();
  }, [token, viewMode]);

  const handleSelectCalendar = (id) => {
    setSelectedCalendarId(id);
  };

  const handleCreateCalendar = async ({ title, shared }) => {
    try {
      const newCalendar = await createCalendar(token, { title });
      if (shared) {
        await toggleVisibility(token, newCalendar.id, true);
      }
      await loadCalendars();
    } catch (err) {
      console.error("Create calendar failed", err);
    }
  };

  const handleUnsubscribe = () => {};

  return (
    <div>
      <h1>My Calendars</h1>
      {!token ? (
        <LoginForm setToken={setToken} />
      ) : (
        <>
          <div style={{ marginBottom: "1em" }}>
            <label>顯示： </label>
            <select
              value={viewMode}
              onChange={(e) => {
                setViewMode(e.target.value);
                setSelectedCalendarId(null);
              }}
            >
              <option value="merged">整合事件時序</option>
              <option value="mine">我的行事曆</option>
              <option value="subscribed">訂閱的行事曆</option>
            </select>
          </div>

          {viewMode === "mine" ? (
            <>
              <CalendarList
                calendars={myCalendars}
                onSelect={handleSelectCalendar}
              />
              <h3>Create New Calendar</h3>
              <CalendarEditor onSave={handleCreateCalendar} />
              {selectedCalendarId && (
                <>
                  <h1>
                    Calendar:{" "}
                    {myCalendars.find((cal) => cal.id === selectedCalendarId)
                      ?.title || `(ID: ${selectedCalendarId})`}
                  </h1>
                  <EventManager
                    token={token}
                    calendar_id={selectedCalendarId}
                  />
                </>
              )}
            </>
          ) : viewMode === "subscribed" ? (
            <SubscribedCalendarView
              subscribedCalendars={subscribedOnly}
              token={token}
              onUnsubscribeSuccess={loadCalendars}
            />
          ) : (
            <MergedCalendar
              token={token}
              myCalendars={myCalendars}
              subscribedCalendars={subscribedOnly}
            />
          )}
        </>
      )}
    </div>
  );
};

export default DashboardPage;