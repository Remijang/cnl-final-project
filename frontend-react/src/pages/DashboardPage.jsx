import React, { useEffect, useState, useCallback } from "react";
import {
  getUserCalendar,
  getSubscribedCalendars,
  createCalendar,
} from "../services/calendarService";
import CalendarList from "../components/CalendarList"; // Using actual CalendarList
import EventManager from "../components/EventManager"; // Using actual EventManager
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
  const [viewMode, setViewMode] = useState("subscribed"); // Changed default to "subscribed"
  const [message, setMessage] = useState({ type: "", text: "" }); // State for custom messages

  const navigate = useNavigate(); // Initialize useNavigate

  const loadCalendars = useCallback(async () => {
    setMessage({ type: "", text: "" }); // Clear messages on new fetch
    if (!token) {
      // This case should be handled by the useEffect redirect, but good for defensive coding
      setMessage({ type: "error", text: "認證令牌遺失。請重新登入。" });
      return;
    }
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
      console.error("載入行事曆失敗:", err);
      setMessage({
        type: "error",
        text: `載入行事曆失敗：${err.message || "未知錯誤"}`,
      });
    }
  }, [token]);

  useEffect(() => {
    // Redirect to login page if no token is found
    if (!token) {
      navigate("/login");
      return; // Stop further rendering of dashboard content
    }

    // Fetch all calendars for logged-in users
    loadCalendars();
  }, [token, navigate, loadCalendars]); // Added loadCalendars to dependencies

  const handleSelectCalendar = (id) => {
    setSelectedCalendarId(id);
  };

  const handleCreateCalendar = async ({ title, shared }) => {
    setMessage({ type: "", text: "" }); // Clear previous messages
    try {
      const newCalendar = await createCalendar(token, { title });
      if (shared) {
        await toggleVisibility(token, newCalendar.id, true);
      }
      setMessage({ type: "success", text: `行事曆 "${title}" 建立成功！` });
      await loadCalendars(); // Reload all calendars to show the new one
    } catch (err) {
      console.error("建立行事曆失敗:", err);
      setMessage({
        type: "error",
        text: `建立行事曆失敗：${err.message || "未知錯誤"}`,
      });
    }
  };

  const handleUnsubscribeSuccess = useCallback(() => {
    loadCalendars(); // Reload calendars when an unsubscribe happens in SubscribedCalendarView
  }, [loadCalendars]);

  // If there's no token, return null to prevent rendering dashboard UI before redirect
  if (!token) {
    return null; // Or a small loading spinner if desired
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-10">
        {/* Header Section: Title and View Mode Selector */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight text-center sm:text-left mb-4 sm:mb-0">
            Calendar Dashboard
          </h1>

          {/* View Mode Selector */}
          <div className="flex items-center">
            <select
              id="view-mode-select"
              value={viewMode}
              onChange={(e) => {
                setViewMode(e.target.value);
                setSelectedCalendarId(null); // Clear selection when changing view mode
              }}
              className="block w-full sm:w-auto px-3 py-2 bg-indigo-50 border border-indigo-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150"
            >
              <option value="merged">Aggregated Calendar</option>
              <option value="mine">My Calendar</option>
              <option value="subscribed">Subscribed Calendar</option>
            </select>
          </div>
        </div>

        {/* Banner for the Dashboard page */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 rounded-lg shadow-md mb-8 text-center">
          <p className="text-lg font-semibold">
            Welcome to your Calendar Dashboard!
          </p>
          <p className="text-sm opacity-90">
            Manage your personal calendars, explore subscribed ones, or view
            them all in one place.
          </p>
        </div>

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

        {/* Conditional Rendering based on viewMode */}
        {viewMode === "mine" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* My Calendars List and Create New Calendar */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                My Calendar
              </h2>
              <CalendarList // Using actual CalendarList
                calendars={myCalendars}
                onSelect={handleSelectCalendar}
                selectedCalendarId={selectedCalendarId}
              />
              <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4">
                Add New Calendar
              </h2>
              <CalendarEditor onSave={handleCreateCalendar} />
            </div>

            {/* Selected Calendar Event Manager */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              {selectedCalendarId ? (
                <>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Calendar{" "}
                    <span className="text-blue-600">
                      {myCalendars.find((cal) => cal.id === selectedCalendarId)
                        ?.title || `(ID: ${selectedCalendarId})`}
                    </span>
                  </h2>
                  <EventManager // Using actual EventManager
                    token={token}
                    calendar_id={selectedCalendarId}
                  />
                </>
              ) : (
                <div className="text-center text-gray-600 h-full flex items-center justify-center">
                  <p className="text-2xl">Select a calendar from the left</p>
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
              onUnsubscribeSuccess={handleUnsubscribeSuccess} // Pass the callback for successful unsubscribe
            />
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Aggregated Calendar
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
