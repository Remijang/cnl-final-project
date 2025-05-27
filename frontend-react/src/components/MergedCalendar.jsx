// 📁 src/components/MergedCalendar.jsx
import React, { useEffect, useState } from "react";
import { getEventsByCalendar } from "../services/eventService";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../css/Calendar.css";

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
          console.error(`Fail to load calendar ${cal.id}`, err);
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
      <div>
        <Calendar
          value={selectedDate}
          onChange={setSelectedDate}
          locale={"en"}
          tileContent={({ date, view }) =>
            view === "month" ? renderEventsOnDate(date) : null
          }
        />
      </div>
      <h3 className="text-center font-bold mt-2 mb-2">
        Events on {selectedDate.toLocaleDateString()}
      </h3>
      <table className="w-full table-fixed border-collapse">
        <thead>
          <tr>
            <th className="w-1/3 border-2 border-black text-center">
              Event Title
            </th>
            <th className="w-1/2 border-2 border-black text-center">Time</th>
            <th className="w-1/6 border-2 border-black text-center">
              Deletion
            </th>
          </tr>
        </thead>
        <tbody>
          {selectedEvents.map((ev) => (
            <tr key={ev.id}>
              <td className="border-2 border-black text-center">{ev.title}</td>
              <td className="border-2 border-black text-center">
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
              <td className="border-2 border-black text-center">
                <button
                  onClick={() => handleDeleteEvent(ev.id)}
                  className="bg-red-600 text-white py-0.4 px-2 text-xs rounded hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <table className="w-full table-fixed">
        <thead>
          <tr>
            <th className="w-1/3 text-center">Event Title</th>
            <th className="w-1/2 text-center">Time</th>
            <th className="w-1/6 text-center">Deletion</th>
          </tr>
        </thead>
        <tbody>
          {selectedEvents.map((ev) => (
            <tr key={ev.id}>
              <td className="text-center">{ev.title}</td>
              <td className="text-center">
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
              <td className="text-center">
                <button
                  onClick={() => handleDeleteEvent(ev.id)}
                  className="bg-red-600 text-white py-0.4 px-2 text-xs rounded hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MergedCalendar;
