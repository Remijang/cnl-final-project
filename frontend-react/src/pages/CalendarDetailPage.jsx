import React, { useEffect, useState } from "react";
import EventManager from "../components/EventManager";
import { useParams } from "react-router-dom";
import {
  getUserCalendar,
  getSubscribedCalendars,
} from "../services/calendarService";

const CalendarDetailPage = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const { calendarId } = useParams();
  const [calendarDetails, setCalendarDetails] = useState(null);
  const [message, setMessage] = useState({
    type: "info",
    text: "載入日曆資訊中...",
  }); // State for custom messages

  const findCalendar = async () => {
    setMessage({ type: "info", text: "載入日曆資訊中..." }); // Set loading message
    try {
      const [ownedCals, subCals] = await Promise.all([
        getUserCalendar(token),
        getSubscribedCalendars(token),
      ]);

      const allCals = [...ownedCals, ...subCals];
      const targetCal = allCals.find((cal) => cal.id.toString() === calendarId);

      if (!targetCal) {
        setMessage({ type: "error", text: "日曆不存在或無權限查看。" });
        setCalendarDetails(null); // Clear details if not found
        return;
      }
      setCalendarDetails(targetCal);
      setMessage({ type: "success", text: "" }); // Clear message on success
    } catch (err) {
      console.error("取得日曆失敗:", err);
      setMessage({
        type: "error",
        text: `取得日曆失敗：${err.message || "未知錯誤"}`,
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
      setMessage({ type: "error", text: "認證令牌或日曆ID遺失。請先登入。" });
    }
  }, [token, calendarId]); // Removed findCalendar from dependencies to prevent infinite loop

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
                <p>擁有者: {calendarDetails.owner?.name || "未知"}</p>
                <p>
                  最後更新:{" "}
                  {new Date(calendarDetails.updated_at).toLocaleString()}
                </p>
              </div>
            </header>

            <EventManager
              token={token}
              calendar_id={calendarId}
              className="mt-8" // Use Tailwind class for margin
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
