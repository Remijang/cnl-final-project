import React, { useEffect, useState } from "react";
import { getEventsByCalendar } from "../services/eventService";

const SubscribedCalendarView = ({ subscribedCalendars = [], token }) => {
  const [calendarEvents, setCalendarEvents] = useState({});

  useEffect(() => {
    const fetchAllEvents = async () => {
      const allEvents = {};
      for (let cal of subscribedCalendars) {
        try {
          const events = await getEventsByCalendar(token, cal.id);
          allEvents[cal.id] = events;
        } catch (err) {
          console.error(`讀取日曆 ${cal.id} 失敗`, err);
          allEvents[cal.id] = [];
        }
      }
      setCalendarEvents(allEvents);
    };

    if (token && subscribedCalendars.length > 0) {
      fetchAllEvents();
    }
  }, [token, subscribedCalendars]);
  return (
    <div>
      <h2>訂閱的行事曆</h2>
      {subscribedCalendars.map((cal) => (
        <div key={cal.id} style={{ marginBottom: "1em" }}>
          <h3>{cal.title}</h3>
          <ul>
            {(calendarEvents[cal.id] || []).map((ev) => (
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
