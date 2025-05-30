import React, { useState } from "react";
import { unsubscribeCalendar } from "../services/subscriptionService";
import MergedCalendar from "./MergedCalendar"; // Using the actual MergedCalendar component

const SubscribedCalendarView = ({
  myCalendars = [], // Renamed from mycalendars for consistency and clarity
  subscribedCalendars = [],
  setReload,
  token,
}) => {
  const [message, setMessage] = useState({ type: "", text: "" }); // State for custom messages

  const handleUnsubscribe = async (calendarId, calendarTitle) => {
    setMessage({ type: "", text: "" }); // Clear previous messages
    try {
      await unsubscribeCalendar(token, calendarId);
      setMessage({
        type: "success",
        text: `Successfully unsubscribe calendar ${calendarTitle}.`,
      });
    } catch (err) {
      console.error("Unsubscribe failed", err);
      setMessage({
        type: "error",
        text: `Unsubscribe failed: ${err.message || "Unknown error"}`,
      });
    } finally {
      setReload(true); // Trigger a reload of the calendar list
    }
  };

  return (
    <div className="font-sans">
      <div className="mx-auto">
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

        {/* Pass both myCalendars and subscribedCalendars to MergedCalendar */}
        <MergedCalendar
          token={token}
          myCalendars={myCalendars}
          subscribedCalendars={subscribedCalendars}
        />

        {/* Section to manage individual subscribed calendars for unsubscribe */}
        <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4 text-center">
          Manage Subscriptions
        </h2>
        {subscribedCalendars.length === 0 ? (
          <p className="text-gray-600 text-center">
            You haven't subscribed to any calendar yet.
          </p>
        ) : (
          <div className="space-y-6">
            {subscribedCalendars.map((cal) => (
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-gray-800">
                  Title: {`${cal.title}`}
                </h3>

                {/* The Unsubscribe button - now direct action */}
                <button
                  onClick={() => handleUnsubscribe(cal.id, cal.title)} // Direct call to handler
                  className="text-sm px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200 shadow-md"
                >
                  Unsubscribe Calendar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscribedCalendarView;
