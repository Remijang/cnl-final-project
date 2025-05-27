import React, { useEffect, useState, useCallback } from "react";
import {
  getUserCalendar,
  getSubscribedCalendars,
  createCalendar,
} from "../services/calendarService";
import CalendarList from "../components/CalendarList";
import EventManager from "../components/EventManager";
import LoginForm from "../components/LoginForm"; // LoginForm is still imported but will not be rendered directly if redirecting
import CalendarEditor from "../components/CalendarEditor";
import { toggleVisibility } from "../services/permissionService";
import SubscribedCalendarView from "../components/SubscribedCalendarView";
import MergedCalendar from "../components/MergedCalendar";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const DashboardPage = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [myCalendars, setMyCalendars] = useState([]);
  const [subscribedCalendars, setSubscribedCalendars] = useState([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState(null);
  const [subscribedOnly, setSubscribedOnly] = useState([]);
  const [viewMode, setViewMode] = useState("merged"); // "mine" or "subscribed"

  const navigate = useNavigate(); // Initialize useNavigate

  // Original loadCalendars function
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
    // Redirect to login page if no token is found
    if (!token) {
      navigate("/login");
      return; // Stop further rendering of dashboard content
    }

    // Original fetchAll logic for logged-in users
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
  }, [token, viewMode, navigate]); // Added navigate to dependencies

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

  // If there's no token, return null to prevent rendering dashboard UI before redirect
  if (!token) {
    return null; // Or a small loading spinner if desired
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-10">
        {/* Header Section: Title and View Mode Selector - ONLY when logged in */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight text-center sm:text-left mb-4 sm:mb-0">
            Calendar Dashboard
          </h1>

          {/* View Mode Selector (formerly "search box" or main control) */}
          <div className="flex items-center">
            <select
              id="view-mode-select"
              value={viewMode}
              onChange={(e) => {
                setViewMode(e.target.value);
                setSelectedCalendarId(null);
              }}
              className="block w-full sm:w-auto px-3 py-2 bg-indigo-50 border border-indigo-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150"
            >
              <option value="merged">All Calendar</option>
              <option value="mine">My Calendar</option>
              <option value="subscribed">Subscribed Calendar</option>
            </select>
          </div>
        </div>

        {/* Conditional Rendering based on viewMode */}
        {viewMode === "mine" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* My Calendars List and Create New Calendar */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                My Calendar
              </h2>
              <CalendarList
                calendars={myCalendars}
                onSelect={handleSelectCalendar}
              />
              <h3 className="text-xl font-bold text-gray-800 mt-8 mb-4">
                Add New Calendar
              </h3>
              <CalendarEditor onSave={handleCreateCalendar} />
            </div>

            {/* Selected Calendar Event Manager */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              {selectedCalendarId ? (
                <>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Calendar:{" "}
                    <span className="text-blue-600">
                      {myCalendars.find((cal) => cal.id === selectedCalendarId)
                        ?.title || `(ID: ${selectedCalendarId})`}
                    </span>
                  </h2>
                  <EventManager
                    token={token}
                    calendar_id={selectedCalendarId}
                  />
                </>
              ) : (
                <div className="text-center text-gray-600 h-full flex items-center justify-center">
                  <p>Choose a calendar from the left</p>
                </div>
              )}
            </div>
          </div>
        ) : viewMode === "subscribed" ? (
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Subscribed Calendar
            </h2>
            <SubscribedCalendarView
              subscribedCalendars={subscribedOnly}
              token={token}
              onUnsubscribeSuccess={loadCalendars}
            />
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              All Calendar
            </h2>
            <MergedCalendar
              token={token}
              myCalendars={myCalendars}
              subscribedCalendars={subscribedOnly}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
