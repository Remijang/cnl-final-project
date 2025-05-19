import React from "react";

const SubscribedCalendarView = ({ subscribedCalendars }) => {
  return (
    <div>
      <h2>訂閱的行事曆</h2>
      {subscribedCalendars.map((cal) => (
        <div key={cal.id} style={{ marginBottom: "1em" }}>
          <h3>{cal.title}</h3>
          <ul>
            {cal.events.map((ev) => (
              <li key={ev.id}>
                {ev.title}：{ev.start_time} - {ev.end_time}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default SubscribedCalendarView;
