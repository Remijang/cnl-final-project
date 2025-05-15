import React, { useEffect, useState } from "react";
import CalendarList from "./components/CalendarList";

const App = () => {
  const [calendars, setCalendars] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/calendars/1")
      .then((res) => res.json())
      .then((data) => setCalendars(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1>My Calendars</h1>
      <CalendarList calendars={calendars} />
    </div>
  );
};

export default App;
