// 📁 src/components/CalendarSearchByUser.jsx
import React, { useState } from "react";
import { searchCalendarByUser } from "../services/calendarService";

const CalendarSearchByUser = ({ token }) => {
  const [username, setUsername] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    setError("");
    try {
      const data = await searchCalendarByUser(token, username);
      setResults(data);
    } catch (err) {
      console.error("查詢失敗", err);
      setError("找不到該使用者或使用者沒有公開行事曆");
    }
  };

  return (
    <div style={{ marginTop: "2em" }}>
      <h2>🔍 搜尋他人行事曆</h2>
      <input
        type="text"
        value={username}
        placeholder="輸入使用者名稱"
        onChange={(e) => setUsername(e.target.value)}
      />
      <button onClick={handleSearch}>查詢</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {results.map((cal) => (
        <div key={cal.id} style={{ marginTop: "1em" }}>
          <h4>{cal.title}</h4>
          <p>Calendar ID: {cal.id}</p>
        </div>
      ))}
    </div>
  );
};

export default CalendarSearchByUser;
