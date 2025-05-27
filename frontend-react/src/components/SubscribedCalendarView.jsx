import React, { useState } from "react";
import { unsubscribeCalendar } from "../services/subscriptionService";
import MergedCalendar from "./MergedCalendar"; // Using the actual MergedCalendar component

const SubscribedCalendarView = ({
  myCalendars = [], // Renamed from mycalendars for consistency and clarity
  subscribedCalendars = [],
  token,
  onUnsubscribeSuccess,
}) => {
  const [message, setMessage] = useState({ type: "", text: "" }); // State for custom messages

  const handleUnsubscribe = async (calendarId, calendarTitle) => {
    setMessage({ type: "", text: "" }); // Clear previous messages
    try {
      await unsubscribeCalendar(token, calendarId);
      setMessage({
        type: "success",
        text: `Successfully unsubscribed from ${calendarTitle}.`,
      });
      if (onUnsubscribeSuccess) {
        onUnsubscribeSuccess(); // Trigger parent to re-fetch calendar list
      }
    } catch (err) {
      console.error("Unsubscribe failed", err);
      setMessage({
        type: "error",
        text: `Unsubscribe failed: ${err.message || "Unknown error"}`,
      });
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

        {/* Display the Merged Calendar */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          All Your Events
        </h2>
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
            You haven't subscribed to any calendars yet.
          </p>
        ) : (
          <div className="space-y-6">
            {subscribedCalendars.map((cal) => (
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
                <button
                  onClick={() => handleUnsubscribe(cal.id, cal.title)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200 shadow-md"
                >
                  Unsubscribe
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
