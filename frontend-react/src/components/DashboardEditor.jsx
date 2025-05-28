import React, { useEffect, useState, useCallback } from "react";
import { getCalendar } from "../services/calendarService";
import CalendarList from "./CalendarList"; // Using actual CalendarList
import EventManager from "./EventManager"; // Using actual EventManager
import { useNavigate } from "react-router-dom"; // Import useNavigate

const DashboardEditor = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [editCalendars, setEditCalendars] = useState([]);
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
      const editCals = await getCalendar(token, "write");
      setEditCalendars(editCals);
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
          <h2 className="text-4xl font-extrabold text-gray-800 tracking-tight text-center sm:text-left mb-4 sm:mb-0">
            Calendar Editor
          </h2>
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

        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8">
          {/* My Calendars List and Create New Calendar */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
            <CalendarList // Using actual CalendarList
              calendars={editCalendars}
              onSelect={handleSelectCalendar}
              selectedCalendarId={selectedCalendarId}
              token={token}
              mode="edit" // Pass mode prop to indicate edit mode
            />
          </div>

          {/* Selected Calendar Event Manager */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            {selectedCalendarId ? (
              <>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Calendar{" "}
                  <span className="text-blue-600">
                    {editCalendars.find((cal) => cal.id === selectedCalendarId)
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
      </div>
    </div>
  );
};

export default DashboardEditor;
