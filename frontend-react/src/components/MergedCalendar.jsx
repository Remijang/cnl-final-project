import React, { useEffect, useState } from "react";
import { getEventsByCalendar } from "../services/eventService";

const MergedCalendar = ({
  token,
  myCalendars = [],
  subscribedCalendars = [],
}) => {
  const [mergedEvents, setMergedEvents] = useState([]);

  useEffect(() => {
    const fetchAllEvents = async () => {
      const allCalendars = [...myCalendars, ...subscribedCalendars];
      let allEvents = [];

      for (let cal of allCalendars) {
        try {
          const events = await getEventsByCalendar(token, cal.id);
          const labeled = events.map((ev) => ({
            ...ev,
            calendarTitle: cal.title,
          }));
          allEvents = [...allEvents, ...labeled];
        } catch (err) {
          console.error(`讀取日曆 ${cal.id} 失敗`, err);
        }
      }

      const sorted = allEvents.sort(
        (a, b) => new Date(a.start_time) - new Date(b.start_time)
      );
      setMergedEvents(sorted);
    };

    if (token && (myCalendars.length > 0 || subscribedCalendars.length > 0)) {
      fetchAllEvents();
    }
  }, [token, myCalendars, subscribedCalendars]);

  return (
    <div>
      <h2>所有事件時序表</h2>
      <ul>
        {mergedEvents.map((ev) => (
          <li key={ev.id}>
            <strong>{ev.title}</strong> - {ev.start_time} ~ {ev.end_time} <br />
            <em>from: {ev.calendarTitle}</em>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MergedCalendar;
