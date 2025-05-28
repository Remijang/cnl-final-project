import React, { useEffect, useState, useCallback } from "react";
import { getCalendar, createCalendar } from "../services/calendarService";
import AdminCalendarList from "./AdminCalendarList"; // Using actual CalendarList
import CalendarEditor from "../components/CalendarEditor";
import { toggleVisibility } from "../services/permissionService";

import { useNavigate } from "react-router-dom"; // Import useNavigate

const DashboardAdmin = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [myCalendars, setMyCalendars] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" }); // State for custom messages
  const [reload, setReload] = useState(false); // State to trigger reloads

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
      const myCals = await getCalendar(token, "owned");
      setMyCalendars(myCals);
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

  useEffect(() => {
    if (!reload) return;
    loadCalendars(); // Reload calendars when reload state changes
    setReload(false); // Reset reload state after loading
  }, [reload]); // Reload calendars when reload state changes

  const handleCreateCalendar = async ({ title, shared }) => {
    setMessage({ type: "", text: "" }); // Clear previous messages

    if (!title || title.trim() === "") {
      setMessage({
        type: "error",
        text: "Calendar name cannot be blank.",
      });
      return; // Stop the function if the title is blank
    }

    try {
      const newCalendar = await createCalendar(token, { title });
      if (shared) {
        await toggleVisibility(token, newCalendar.id, true);
      }
      setMessage({
        type: "success",
        text: `Calendar "${title}" created successfully!`,
      });
      await loadCalendars(); // Reload all calendars to show the new one
    } catch (err) {
      console.error("Failed to create calendar:", err);
      setMessage({
        type: "error",
        text: `Failed to create calendar: ${err.message || "Unknown error"}`,
      });
    }
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
            Calendar Admin
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
        <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4">
          Add New Calendar
        </h2>
        <CalendarEditor onSave={handleCreateCalendar} />

        {/* My Calendars List and Create New Calendar */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Administrate My Calendars
          </h2>
          <AdminCalendarList // Using actual CalendarList
            calendars={myCalendars}
            token={token}
            setReload={setReload} // Pass setReload to trigger reloads
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;

