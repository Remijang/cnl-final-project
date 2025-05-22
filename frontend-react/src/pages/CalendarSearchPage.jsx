// src/pages/CalendarSearchPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getVisibleCalendarByUsername } from "../services/calendarService";

const CalendarSearchPage = ({ token }) => {
  const { username } = useParams();
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCalendars = async () => {
      try {
        const data = await getVisibleCalendarByUsername(token, username);
        setResults(data);
      } catch (err) {
        console.error("查詢失敗", err);
        setError("找不到使用者，或該使用者沒有公開行事曆");
      }
    };

    if (token && username) fetchCalendars();
  }, [token, username]);

  return (
    <div style={{ padding: "1em" }}>
      <h2>使用者「{username}」的公開行事曆</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {results.map((cal) => (
        <div key={cal.id} style={{ marginBottom: "1em" }}>
          <h4>{cal.title}</h4>
          <p>Calendar ID: {cal.id}</p>
        </div>
      ))}
    </div>
  );
};

export default CalendarSearchPage;
