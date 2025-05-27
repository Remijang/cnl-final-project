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
  const [error, setError] = useState("");

  const findCalendar = async () => {
    try {
      const [ownedCals, subCals] = await Promise.all([
        getUserCalendar(token),
        getSubscribedCalendars(token),
      ]);

      const allCals = [...ownedCals, ...subCals];
      const targetCal = allCals.find((cal) => cal.id.toString() === calendarId);

      if (!targetCal) {
        setError("日曆不存在或無權限查看");
        return;
      }
      setCalendarDetails(targetCal);
    } catch (err) {
      setError(err.message || "取得日曆失敗");
      if (err.response?.status === 403) {
        window.location.href = "/unauthorized";
      }
    }
  };

  useEffect(() => {
    if (token && calendarId) findCalendar();
  }, [token, calendarId]);

  if (error) return <div className="error-message">{error}</div>;
  if (!calendarDetails) return <div className="loading">載入中...</div>;

  return (
    <div className="calendar-detail-container">
      <header className="calendar-header">
        <h1>{calendarDetails.title}</h1>
        <div className="meta-info">
          <span>擁有者：{calendarDetails.owner?.name || "未知"}</span>
          <span>
            最後更新：{new Date(calendarDetails.updated_at).toLocaleString()}
          </span>
        </div>
      </header>

      <EventManager
        token={token}
        calendar_id={calendarId}
        style={{ marginTop: "2rem" }}
      />
    </div>
  );
};

export default CalendarDetailPage;
