import React from "react";
import EventManager from "../components/EventManager";

const CalendarDetailPage = ({ token, calendarId }) => {
  return (
    <div>
      <h2>Calendar Detail</h2>
      <EventManager token={token} calendarId={calendarId} />
    </div>
  );
};

export default CalendarDetailPage;
