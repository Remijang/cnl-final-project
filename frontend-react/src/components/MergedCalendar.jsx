// 📁 src/components/MergedCalendar.jsx
import React, { useEffect, useState } from "react";
import { getEventsByCalendar } from "../services/eventService";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const MergedCalendar = ({
  token,
  myCalendars = [],
  subscribedCalendars = [],
}) => {
  const [mergedEvents, setMergedEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const selectedEvents = mergedEvents.filter(
    (ev) =>
      new Date(ev.start_time).toDateString() === selectedDate.toDateString()
  );

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

      setMergedEvents(allEvents);
    };

    if (token && (myCalendars.length > 0 || subscribedCalendars.length > 0)) {
      fetchAllEvents();
    }
  }, [token, myCalendars, subscribedCalendars]);

  const renderEventsOnDate = (date) => {
    const dayEvents = mergedEvents.filter((ev) => {
      const eventDate = new Date(ev.start_time).toISOString().slice(0, 10);
      return eventDate === date.toISOString().slice(0, 10);
    });

    return (
      <div className="tile-events">
        {dayEvents.slice(0, 2).map((ev) => (
          <div
            className="event-dot"
            key={ev.id}
            title={`${ev.title} (${ev.calendarTitle})`}
          >
            • {ev.title.length > 5 ? ev.title.slice(0, 5) + "…" : ev.title}
          </div>
        ))}
        {dayEvents.length > 2 && <div className="event-dot">⋯</div>}
      </div>
    );
  };

  return (
    <div>
      <h2>所有事件月曆</h2>
      <Calendar
        value={selectedDate}
        onChange={setSelectedDate}
        tileContent={({ date, view }) =>
          view === "month" ? renderEventsOnDate(date) : null
        }
      />
      <h3>{selectedDate.toLocaleDateString()} 的事件</h3>
      <ul>
        {selectedEvents.map((ev) => (
          <li key={ev.id}>
            {ev.title} - {ev.calendarTitle}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MergedCalendar;
