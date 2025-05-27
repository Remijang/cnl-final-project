import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Import useNavigate
import {
  getVisibleCalendarByUsername,
  getSubscribedCalendars,
} from "../services/calendarService";
import { getEventsByCalendar } from "../services/eventService"; // This import is not used in the provided code, but kept.
import {
  subscribeCalendar,
  unsubscribeCalendar,
} from "../services/subscriptionService";
import MergedCalendar from "../components/MergedCalendar"; // Using the actual MergedCalendar component

const CalendarSearchPage = ({ token }) => {
  const { username } = useParams();
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [eventsMap, setEventsMap] = useState({}); // key: calendar_id, value: events (not used in provided code)
  const [subscribedIds, setSubscribedIds] = useState([]);
  const [expandedMap, setExpandedMap] = useState({});
  const [message, setMessage] = useState({ type: "", text: "" }); // State for custom messages

  const navigate = useNavigate(); // Initialize useNavigate

  // Effect for redirecting if no token is present
  useEffect(() => {
    if (!token) {
      setMessage({
        type: "error",
        text: "Login required to view calendars. Redirecting to login...",
      });
      const timer = setTimeout(() => navigate("/login"), 1500); // Redirect after 1.5 seconds
      return () => clearTimeout(timer); // Clean up the timer
    }
  }, [token, navigate]); // Dependencies: token and navigate

  const fetchCalendars = useCallback(async () => {
    setError("");
    setMessage({ type: "", text: "" }); // Clear messages on new fetch

    // The token check for redirect is now handled by the useEffect above.
    // This `if` block can still be here as a fallback or for specific messages.
    if (!token || !username) {
      setError("Authentication token or username is missing.");
      setMessage({
        type: "error",
        text: "Please log in or provide a username.",
      });
      return;
    }
    try {
      const data = await getVisibleCalendarByUsername(token, username);
      console.log("visible calendar:", data);
      setResults(data);
      if (data.length === 0) {
        setMessage({
          type: "info",
          text: "User not found, or user has no public calendars.",
        });
      }
    } catch (err) {
      console.error("Query failed", err);
      setError("User not found, or user has no public calendars");
      setMessage({
        type: "error",
        text: `Query failed: ${
          err.message || "Unknown error"
        }. User not found, or user has no public calendars.`,
      });
      // If fetching fails due to authentication, redirect
      if (err.response?.status === 401) {
        // Common status for unauthorized
        setMessage({
          type: "error",
          text: "Your session has expired. Please log in again.",
        });
        setTimeout(() => navigate("/login"), 1500);
      }
    }
  }, [token, username, navigate]); // Add navigate to dependencies

  useEffect(() => {
    // Only fetch if a token exists. If not, the useEffect above will redirect.
    if (token) {
      fetchCalendars();
    }
  }, [fetchCalendars, token]); // Add token to dependencies

  useEffect(() => {
    const setInitIds = async () => {
      if (!token) return; // Only fetch if token exists (redundant due to initial check, but harmless)
      try {
        const subscribedCalendars = await getSubscribedCalendars(token);
        const ids = subscribedCalendars.map((c) => c.id);
        setSubscribedIds(ids);
      } catch (err) {
        console.error("Error fetching subscribed calendars: ", err);
        setMessage({
          type: "error",
          text: "Unable to load subscribed calendar information.",
        });
        // If fetching subscribed calendars fails due to authentication, redirect
        if (err.response?.status === 401) {
          setMessage({
            type: "error",
            text: "Your session has expired. Please log in again.",
          });
          setTimeout(() => navigate("/login"), 1500);
        }
      }
    };
    setInitIds();
  }, [token, navigate]); // Add navigate to dependencies

  const handleToggleExpand = (calendarId) => {
    setExpandedMap((prev) => ({
      ...prev,
      [calendarId]: !prev[calendarId],
    }));
  };

  const handleSubscribe = async (calendarId) => {
    setMessage({ type: "", text: "" }); // Clear previous messages
    if (!token) {
      setMessage({
        type: "error",
        text: "Please log in to subscribe or unsubscribe. Redirecting...",
      });
      setTimeout(() => navigate("/login"), 1500); // Redirect if no token on action
      return;
    }
    try {
      if (subscribedIds.includes(calendarId)) {
        await unsubscribeCalendar(token, calendarId);
        setSubscribedIds((prev) => prev.filter((id) => id !== calendarId));
        setMessage({ type: "success", text: "Unsubscribed successfully." });
      } else {
        await subscribeCalendar(token, calendarId);
        setSubscribedIds((prev) => [...prev, calendarId]);
        setMessage({ type: "success", text: "Subscribed successfully!" });
      }
    } catch (err) {
      console.error("Subscription operation failed", err);
      setMessage({
        type: "error",
        text: `Subscription/Unsubscription failed: ${
          err.message || "Unknown error"
        }`,
      });
      // If subscription action fails due to authentication, redirect
      if (err.response?.status === 401) {
        setMessage({
          type: "error",
          text: "Your session has expired. Please log in again.",
        });
        setTimeout(() => navigate("/login"), 1500);
      }
    }
  };

  // If there's no token, we render nothing or a simple message while redirecting.
  // The `useEffect` already handles the `Maps` call.
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        {message.text && (
          <div
            className={`p-3 rounded-md text-lg font-semibold ${
              message.type === "error" ? "bg-red-100 text-red-700" : ""
            }`}
          >
            {message.text}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-10">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center tracking-tight">
          Public Calendars of {username}
        </h1>

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

        {error && <p className="text-red-600 text-center mb-4">{error}</p>}

        {results.length === 0 && !error && !message.text && (
          <p className="text-gray-600 text-center">
            Loading public calendars...
          </p>
        )}

        <div className="space-y-6">
          {results.map((cal) => (
            <div
              key={cal.id}
              className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {cal.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Calendar ID: {cal.id}
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleToggleExpand(cal.id)}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition duration-200 shadow-md"
                >
                  {expandedMap[cal.id] ? "Hide Events" : "Show Events"}
                </button>
                <button
                  onClick={() => handleSubscribe(cal.id)}
                  className={`px-4 py-2 rounded-md transition duration-200 shadow-md ${
                    subscribedIds.includes(cal.id)
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-green-500 hover:bg-green-600 text-white"
                  }`}
                >
                  {subscribedIds.includes(cal.id) ? "Unsubscribe" : "Subscribe"}
                </button>
              </div>
              {expandedMap[cal.id] && (
                <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <MergedCalendar // Using the actual MergedCalendar component
                    token={token}
                    myCalendars={[]} // Pass only this calendar for display in MergedCalendar
                    subscribedCalendars={[cal]}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarSearchPage;
