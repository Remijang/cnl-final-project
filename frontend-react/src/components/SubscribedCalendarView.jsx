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
          console.error(`讀取日曆 ${cal.id} 失敗`, err);
          allEvents[cal.id] = [];
          setMessage({ type: "error", text: `讀取日曆 ${cal.title} 失敗。` });
        }
      }
      setCalendarEvents(allEvents);
    };

    if (token && subscribedCalendars.length > 0) {
      fetchAllEvents();
    } else if (subscribedCalendars.length === 0) {
      // If there are no subscribed calendars, clear any previous events and messages
      setCalendarEvents({});
      setMessage({ type: "info", text: "您尚未訂閱任何行事曆。" });
    }
  }, [token, subscribedCalendars]);

  const handleUnsubscribe = async (calendarId, calendarTitle) => {
    setMessage({ type: "", text: "" }); // Clear previous messages
    try {
      await unsubscribeCalendar(token, calendarId);
      setMessage({
        type: "success",
        text: `已成功取消訂閱 ${calendarTitle}。`,
      });
      if (onUnsubscribeSuccess) {
        onUnsubscribeSuccess(); // Trigger parent to re-fetch calendar list
      }
    } catch (err) {
      console.error("取消訂閱失敗", err);
      setMessage({
        type: "error",
        text: `取消訂閱失敗：${err.message || "未知錯誤"}`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-10">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center tracking-tight">
          My Subscribed Calendars
        </h1>

        {/* Banner for the Subscribed Calendars page */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-lg shadow-md mb-8 text-center">
          <p className="text-lg font-semibold">
            Manage your subscribed calendars here!
          </p>
          <p className="text-sm opacity-90">
            View events from calendars you've subscribed to and unsubscribe if
            needed.
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

        {subscribedCalendars.length === 0 && message.type !== "error" ? ( // Only show this if no calendars and no error message
          <p className="text-gray-600 text-center">您尚未訂閱任何行事曆。</p>
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
                  取消訂閱
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
