// 📁 src/components/MergedCalendar.jsx
import React, { useEffect, useState } from "react";
import { getEventsByCalendar } from "../services/eventService";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./Calendar.css";

const MergedCalendar = ({
  token,
  myCalendars = [],
  subscribedCalendars = [],
}) => {
  const [mergedEvents, setMergedEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const selectedEvents = mergedEvents.filter((ev) => {
    const start = new Date(ev.start_time);
    const end = new Date(ev.end_time);
    const currentDate = new Date(selectedDate);
    currentDate.setHours(0, 0, 0, 0);

    return (
      currentDate >= new Date(start.setHours(0, 0, 0, 0)) &&
      currentDate <= new Date(end.setHours(23, 59, 59, 999))
    );
  });

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
      const start = new Date(ev.start_time);
      const end = new Date(ev.end_time);
      const currentDate = new Date(date);
      currentDate.setHours(0, 0, 0, 0);

      return (
        currentDate >= new Date(start.setHours(0, 0, 0, 0)) &&
        currentDate <= new Date(end.setHours(23, 59, 59, 999))
      );
    });

    const visibleEvents =
      dayEvents.length <= 3 ? dayEvents : dayEvents.slice(0, 2);
    const hiddenCount = dayEvents.length > 3 ? dayEvents.length - 2 : 0;

    return (
      <ul className="event-list">
        {visibleEvents.map((ev) => (
          <li key={ev.id}>
            <strong>{ev.title}</strong>
          </li>
        ))}
        {hiddenCount > 0 && (
          <li style={{ color: "blue" }}>+{hiddenCount} 更多</li>
        )}
      </ul>
    );
  };

  return (
    <div>
      <h2>所有事件月曆</h2>
      <div>
        <Calendar
          value={selectedDate}
          onChange={setSelectedDate}
          tileContent={({ date, view }) =>
            view === "month" ? renderEventsOnDate(date) : null
          }
        />
      </div>
      <h3>{selectedDate.toLocaleDateString()} 的事件</h3>
      <table
        border="1"
        cellPadding="6"
        style={{ borderCollapse: "collapse", width: "100%" }}
      >
        <thead>
          <tr>
            <th>事件標題</th>
            <th>時間</th>
            <th>行事曆</th>
          </tr>
        </thead>
        <tbody>
          {selectedEvents.map((ev) => (
            <tr key={ev.id}>
              <td>{ev.title}</td>
              <td>
                {new Date(ev.start_time).toDateString() ===
                new Date(ev.end_time).toDateString()
                  ? `${new Date(ev.start_time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })} - ${new Date(ev.end_time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`
                  : `${new Date(ev.start_time).toLocaleString([], {
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })} - ${new Date(ev.end_time).toLocaleString([], {
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`}
              </td>

              <td>{ev.calendarTitle}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MergedCalendar;
