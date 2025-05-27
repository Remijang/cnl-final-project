import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
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

  const fetchCalendars = useCallback(async () => {
    setError("");
    setMessage({ type: "", text: "" }); // Clear messages on new fetch
    if (!token || !username) {
      // This scenario should ideally be handled by a redirect in parent component if login is required
      setError("認證令牌或使用者名稱遺失。");
      setMessage({ type: "error", text: "請先登入或提供使用者名稱。" });
      return;
    }
    try {
      const data = await getVisibleCalendarByUsername(token, username);
      console.log("visible calendar:", data);
      setResults(data);
      if (data.length === 0) {
        setMessage({
          type: "info",
          text: "找不到該使用者，或該使用者沒有公開行事曆。",
        });
      }
    } catch (err) {
      console.error("查詢失敗", err);
      setError("找不到使用者，或該使用者沒有公開行事曆");
      setMessage({
        type: "error",
        text: "查詢失敗：找不到使用者，或該使用者沒有公開行事曆。",
      });
    }
  }, [token, username]);

  useEffect(() => {
    fetchCalendars();
  }, [fetchCalendars]);

  useEffect(() => {
    const setInitIds = async () => {
      if (!token) return; // Only fetch if token exists
      try {
        const subscribedCalendars = await getSubscribedCalendars(token);
        const ids = subscribedCalendars.map((c) => c.id);
        setSubscribedIds(ids);
      } catch (err) {
        console.error("Error fetching subscribed calendars: ", err);
        setMessage({ type: "error", text: "無法載入已訂閱的行事曆資訊。" });
      }
    };
    setInitIds();
  }, [token]);

  const handleToggleExpand = (calendarId) => {
    setExpandedMap((prev) => ({
      ...prev,
      [calendarId]: !prev[calendarId],
    }));
  };

  const handleSubscribe = async (calendarId) => {
    setMessage({ type: "", text: "" }); // Clear previous messages
    if (!token) {
      setMessage({ type: "error", text: "請先登入才能訂閱或取消訂閱。" });
      return;
    }
    try {
      if (subscribedIds.includes(calendarId)) {
        await unsubscribeCalendar(token, calendarId);
        setSubscribedIds((prev) => prev.filter((id) => id !== calendarId));
        setMessage({ type: "success", text: "已取消訂閱。" });
      } else {
        await subscribeCalendar(token, calendarId);
        setSubscribedIds((prev) => [...prev, calendarId]);
        setMessage({ type: "success", text: "訂閱成功！" });
      }
    } catch (err) {
      console.error("訂閱操作失敗", err);
      setMessage({
        type: "error",
        text: `訂閱/取消失敗：${err.message || "未知錯誤"}`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-10">
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
          <p className="text-gray-600 text-center">正在載入公開行事曆...</p>
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
                  {expandedMap[cal.id] ? "隱藏事件" : "顯示事件"}
                </button>
                <button
                  onClick={() => handleSubscribe(cal.id)}
                  className={`px-4 py-2 rounded-md transition duration-200 shadow-md ${
                    subscribedIds.includes(cal.id)
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-green-500 hover:bg-green-600 text-white"
                  }`}
                >
                  {subscribedIds.includes(cal.id) ? "取消訂閱" : "訂閱"}
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
