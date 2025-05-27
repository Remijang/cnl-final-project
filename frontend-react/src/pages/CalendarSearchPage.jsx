import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getVisibleCalendarByUsername,
  getSubscribedCalendars,
} from "../services/calendarService";
import { getEventsByCalendar } from "../services/eventService";
import {
  subscribeCalendar,
  unsubscribeCalendar,
} from "../services/subscriptionService";

const CalendarSearchPage = ({ token }) => {
  const { username } = useParams();
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [eventsMap, setEventsMap] = useState({}); // key: calendar_id, value: events
  const [subscribedIds, setSubscribedIds] = useState([]);

  useEffect(() => {
    setError("");
    const fetchCalendars = async () => {
      try {
        const data = await getVisibleCalendarByUsername(token, username);
        console.log("visible calendar:", data);
        setResults(data);
      } catch (err) {
        console.error("查詢失敗", err);
        setError("找不到使用者，或該使用者沒有公開行事曆");
      }
    };

    if (token && username) fetchCalendars();
  }, [token, username, subscribedIds]);

  useEffect(() => {
    const setInitIds = async () => {
      try {
        const subscribedCalendars = await getSubscribedCalendars(token);
        const ids = subscribedCalendars.map((c) => c.id);
        setSubscribedIds(ids);
      } catch (err) {
        console.error("error: ", err);
      }
    };
    if (token) setInitIds();
  }, []);

  const handleToggleEvents = async (calendarId) => {
    if (eventsMap[calendarId]) {
      // already fetched, toggle off
      setEventsMap((prev) => {
        const updated = { ...prev };
        delete updated[calendarId];
        return updated;
      });
    } else {
      try {
        const data = await getEventsByCalendar(token, calendarId);
        setEventsMap((prev) => ({ ...prev, [calendarId]: data }));
      } catch (err) {
        console.error("讀取事件失敗", err);
      }
    }
  };

  const handleSubscribe = async (calendarId) => {
    try {
      if (subscribedIds.includes(calendarId)) {
        await unsubscribeCalendar(token, calendarId);
        setSubscribedIds((prev) => prev.filter((id) => id !== calendarId));
        alert("已取消訂閱");
      } else {
        await subscribeCalendar(token, calendarId);
        setSubscribedIds((prev) => [...prev, calendarId]);
        alert("訂閱成功");
      }
    } catch (err) {
      console.error("訂閱操作失敗", err);
      alert("訂閱/取消失敗");
    }
  };

  return (
    <div style={{ padding: "1em" }}>
      <h2>Public Calenar of {username}</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {results.map((cal) => (
        <div
          key={cal.id}
          style={{
            marginBottom: "1.5em",
            borderBottom: "1px solid #ccc",
            paddingBottom: "1em",
          }}
        >
          <h4>{cal.title}</h4>
          <p>Calendar ID: {cal.id}</p>
          <button onClick={() => handleToggleEvents(cal.id)}>
            {eventsMap[cal.id] ? "隱藏事件" : "顯示事件"}
          </button>
          <button
            onClick={() => handleSubscribe(cal.id)}
            style={{ marginLeft: "0.5em" }}
          >
            {subscribedIds.includes(cal.id) ? "取消訂閱" : "訂閱"}
          </button>
          {eventsMap[cal.id] && (
            <ul style={{ marginTop: "0.5em" }}>
              {eventsMap[cal.id].map((ev) => (
                <li key={ev.id}>
                  {ev.title}：{ev.start_time} - {ev.end_time}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};

export default CalendarSearchPage;
