import React, { useEffect, useState } from "react";
import EventManager from "../components/EventManager";
import MergedCalendar from "../components/MergedCalendar";
import { useParams } from "react-router-dom";
import { getCalendar } from "../services/calendarService";

const CalendarDetailPage = ({ token, calendarId }) => {
  //const [token, setToken] = useState(localStorage.getItem("token") || "");
  //const { calendarId } = useParams();
  const [calendarDetails, setCalendarDetails] = useState(null);
  const [message, setMessage] = useState({
    type: "info",
    text: "Loading calendar information...",
  }); // State for custom messages

  const findCalendar = async () => {
    setMessage({ type: "info", text: "Loading calendar information..." }); // Set loading message
    try {
      const allCals = await getCalendar(token, "read");

      const targetCal = allCals.find((cal) => cal.id.toString() === calendarId);

      if (!targetCal) {
        setMessage({
          type: "error",
          text: "Calendar does not exist or you do not have permission to view it.",
        });
        setCalendarDetails(null); // Clear details if not found
        return;
      }
      setCalendarDetails(targetCal);

      setMessage({ type: "success", text: "" }); // Clear message on success
    } catch (err) {
      console.error("Failed to get calendar:", err);
      setMessage({
        type: "error",
        text: `Failed to get calendar: ${err.message || "Unknown error"}`,
      });
      setCalendarDetails(null); // Clear details on error
      if (err.response?.status === 403) {
        // Consider using navigate('/unauthorized') if you have react-router-dom
        window.location.href = "/unauthorized";
      }
    }
  };

  useEffect(() => {
    if (token && calendarId) {
      findCalendar();
    } else {
      setMessage({
        type: "error",
        text: "Authentication token or calendar ID is missing. Please log in first.",
      });
    }
  }, [token, calendarId]); // Removed findCalendar from dependencies to prevent infinite loop

  useEffect(() => {
    console.log("claendar details is: ", calendarDetails);
  }, [calendarDetails]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-10">
        {/* Message Box */}
        {message.text && (
          <div
            className={`p-3 mb-4 rounded-md text-sm text-center ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : message.type === "error"
                ? "bg-red-100 text-red-700"
                : "bg-blue-100 text-blue-700" // Info message style
            }`}
            role="alert"
          >
            {message.text}
          </div>
        )}

        {calendarDetails ? (
          <>
            <header className="mb-8 text-center">
              <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight mb-2">
                {calendarDetails.title}
              </h1>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  Last Updated:{" "}
                  {new Date(calendarDetails.updated_at).toLocaleString()}
                </p>
              </div>
            </header>
            <MergedCalendar
              token={token}
              myCalendars={[calendarDetails]}
              subscribedCalendars={[]}
            />
          </>
        ) : (
          // Only show loading or error message when calendarDetails is null
          <div className="text-center text-gray-600 h-full flex items-center justify-center py-10">
            {message.type === "info" && (
              <p className="text-2xl">{message.text}</p>
            )}
            {message.type === "error" && (
              <p className="text-2xl text-red-600">{message.text}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarDetailPage;
