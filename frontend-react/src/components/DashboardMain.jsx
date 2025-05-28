import React, { useEffect, useState, useCallback } from "react";
import { getCalendar } from "../services/calendarService";
import SubscribedCalendarView from "../components/SubscribedCalendarView";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const DashboardMain = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [myCalendars, setMyCalendars] = useState([]);
  const [subscribedCalendars, setSubscribedCalendars] = useState([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState(null);
  const [subscribedOnly, setSubscribedOnly] = useState([]);
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
      const [myCals, subCals] = await Promise.all([
        getCalendar(token, "owned"),
        getCalendar(token, "subscribed"),
      ]);
      setMyCalendars(myCals);
      setSubscribedCalendars(subCals);
      const subOnly = subCals.filter(
        (sub) => !myCals.some((mine) => Number(mine.id) === Number(sub.id))
      );
      setSubscribedOnly(subOnly);
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
  }, [token]); // Added loadCalendars to dependencies

  useEffect(() => {
    if (!reload) return;
    loadCalendars(); // Reload calendars when reload state changes
    setReload(false); // Reset reload state
  }, [reload]); // This effect can be used to trigger re-renders if needed

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

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Subscribed Calendars
          </h2>
          <SubscribedCalendarView
            myCalendars={myCalendars}
            subscribedCalendars={subscribedOnly}
            token={token}
            setReload={setReload} // Pass the callback for successful unsubscribe
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardMain;
