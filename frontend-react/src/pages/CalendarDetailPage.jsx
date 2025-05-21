import React from "react";
import EventManager from "../components/EventManager";

const CalendarDetailPage = ({ token, calendar_id }) => {
  return (
    <div>
      <h2>Calendar Detail</h2>
      <EventManager token={token} calendar_id={calendar_id} />
    </div>
  );
};

export default CalendarDetailPage;
