import React, { useEffect, useState, useCallback } from "react";
import { getCalendar } from "../services/calendarService";
import CalendarList from "./CalendarList"; // Using actual CalendarList
import { useNavigate } from "react-router-dom"; // Import useNavigate

const DashboardList = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [readCalendars, setReadCalendars] = useState([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" }); // State for custom messages
  const navigate = useNavigate(); // Initialize useNavigate

  const loadCalendars = useCallback(async () => {
    setMessage({ type: "", text: "" }); // Clear messages on new fetch
    if (!token) {
      // This case should be handled by the useEffect redirect, but good for defensive coding
      setMessage({
        type: "error",
        text: "Authentication token missing. Please log in again.",
      });
      return;
    }
    try {
      const readCals = await getCalendar(token, "read");
      setReadCalendars(readCals);
    } catch (err) {
      console.error("Failed to load calendars:", err);
      setMessage({
        type: "error",
        text: `Failed to load calendars: ${err.message || "Unknown error"}`,
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

  // If there's no token, return null to prevent rendering dashboard UI before redirect
  if (!token) {
    return null; // Or a small loading spinner if desired
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-10">
        {/* Header Section: Title and View Mode Selector */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight text-center sm:text-left mb-4 sm:mb-0">
            Calendar List
          </h1>
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

        <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
          {/* My Calendars List and Create New Calendar */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
            <CalendarList // Using actual CalendarList
              calendars={readCalendars}
              onSelect={handleSelectCalendar}
              selectedCalendarId={selectedCalendarId}
              token={token}
              navigate={navigate} // Pass navigate to CalendarList
              mode="view" // Pass mode prop to indicate view mode
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardList;
