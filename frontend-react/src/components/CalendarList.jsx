import React from "react";

const CalendarList = ({ calendars }) => {
  return (
    <div>
      {calendars.map((calendar) => (
        <div key={calendar.id}>
          <h2>{calendar.title}</h2>
          <p>Shared: {calendar.shared ? "Yes" : "No"}</p>
        </div>
      ))}
    </div>
  );
};

export default CalendarList;
