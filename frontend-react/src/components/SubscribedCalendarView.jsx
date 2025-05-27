import React, { useEffect, useState } from "react";
import { getEventsByCalendar } from "../services/eventService";
import { unsubscribeCalendar } from "../services/subscriptionService";
import MergedCalendar from "./MergedCalendar"; // Using the actual MergedCalendar component

const SubscribedCalendarView = ({
  subscribedCalendars = [],
  token,
  onUnsubscribeSuccess,
}) => {
  const [calendarEvents, setCalendarEvents] = useState({});
  const [message, setMessage] = useState({ type: "", text: "" }); // State for custom messages

  useEffect(() => {
    const fetchAllEvents = async () => {
      const allEvents = {};
      setMessage({ type: "", text: "" }); // Clear messages on new fetch
      for (let cal of subscribedCalendars) {
        try {
          const events = await getEventsByCalendar(token, cal.id);
          allEvents[cal.id] = events;
        } catch (err) {
          console.error(`Failed to read calendar ${cal.id}`, err);
          allEvents[cal.id] = [];
          setMessage({
            type: "error",
            text: `Failed to read calendar ${cal.title}.`,
          });
        }
      }
      setCalendarEvents(allEvents);
    };

    if (token && subscribedCalendars.length > 0) {
      fetchAllEvents();
    } else if (subscribedCalendars.length === 0) {
      // If there are no subscribed calendars, clear any previous events and messages
      setCalendarEvents({});
      setMessage({
        type: "info",
        text: "You haven't subscribed to any calendars yet.",
      });
    }
  }, [token, subscribedCalendars]);

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
      {" "}
      {/* Simplified outermost div */}
      <div className="mx-auto">
        {" "}
        {/* Simplified inner container */}
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
        {subscribedCalendars.length === 0 && message.type !== "error" ? (
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
                <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <MergedCalendar
                    token={token}
                    myCalendars={[]}
                    subscribedCalendars={[cal]}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscribedCalendarView;
