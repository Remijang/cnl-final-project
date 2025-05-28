// 📁 src/components/MergedCalendar.jsx
import React, { useEffect, useState } from "react";
import { getEventsByCalendar } from "../services/eventService";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../css/Calendar.css"; // Assuming this CSS file is correctly imported and contains necessary styles

const MergedCalendar = ({
  token,
  myCalendars = [],
  subscribedCalendars = [],
}) => {
  const [mergedEvents, setMergedEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Filter events for the selected date
  const selectedEvents = mergedEvents.filter((ev) => {
    const start = new Date(ev.start_time);
    const end = new Date(ev.end_time);
    const currentDate = new Date(selectedDate);
    currentDate.setHours(0, 0, 0, 0); // Normalize selected date to start of day

    // Check if the event's time range overlaps with the selected date
    return (
      currentDate >= new Date(start.setHours(0, 0, 0, 0)) &&
      currentDate <= new Date(end.setHours(23, 59, 59, 999))
    );
  });

  useEffect(() => {
    const fetchAllEvents = async () => {
      // Combine all calendars (my own and subscribed)
      const allCalendars = [...myCalendars, ...subscribedCalendars];

      // Use a Map to store unique events by their ID, preventing duplicates
      // Assuming event.id is globally unique across all events.
      // If event.id is only unique per calendar, a compound key like `${ev.id}-${cal.id}` would be needed.
      let uniqueEventsMap = new Map();

      for (let cal of allCalendars) {
        try {
          const events = await getEventsByCalendar(token, cal.id);
          for (const ev of events) {
            if (!uniqueEventsMap.has(ev.id)) {
              // Check if event ID is already in the map
              uniqueEventsMap.set(ev.id, {
                ...ev,
                calendarTitle: cal.title, // Add calendar title for display if needed
              });
            }
          }
        } catch (err) {
          console.error(
            `Failed to load events for calendar ${cal.title} (ID: ${cal.id}):`,
            err
          );
          // Optionally, add a message to the user about failed calendar loading
        }
      }
      // Convert Map values back to an array for state
      setMergedEvents(Array.from(uniqueEventsMap.values()));
    };

    // Fetch events only if token is available and there's at least one calendar
    if (token && (myCalendars.length > 0 || subscribedCalendars.length > 0)) {
      fetchAllEvents();
    } else {
      setMergedEvents([]); // Clear events if no calendars are provided or token is missing
    }
  }, [token, myCalendars, subscribedCalendars]); // Re-run effect if these dependencies change

  // Function to render event titles on calendar tiles
  const renderEventsOnDate = (date) => {
    const dayEvents = mergedEvents.filter((ev) => {
      const start = new Date(ev.start_time);
      const end = new Date(ev.end_time);
      const currentDate = new Date(date);
      currentDate.setHours(0, 0, 0, 0); // Normalize current date to start of day

      return (
        currentDate >= new Date(start.setHours(0, 0, 0, 0)) &&
        currentDate <= new Date(end.setHours(23, 59, 59, 999))
      );
    });

    // Display up to 2 events, and then a "+X more" if there are more
    const visibleEvents =
      dayEvents.length <= 3 ? dayEvents : dayEvents.slice(0, 2);
    const hiddenCount = dayEvents.length > 3 ? dayEvents.length - 2 : 0;

    return (
      <ul className="event-list">
        {" "}
        {/* Ensure 'event-list' class is defined in CSS */}
        {visibleEvents.map((ev) => (
          <li key={ev.id}>
            {" "}
            {/* ev.id is now unique within mergedEvents */}
            <strong>{ev.title}</strong>
          </li>
        ))}
        {hiddenCount > 0 && (
          <li style={{ color: "blue" }}>+{hiddenCount} more</li>
        )}
      </ul>
    );
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <Calendar
          value={selectedDate}
          onChange={setSelectedDate}
          locale={"en-US"} // Set locale for calendar display
          tileContent={({ date, view }) =>
            view === "month" ? renderEventsOnDate(date) : null
          }
          className="w-full border-none rounded-lg shadow-inner"
        />
      </div>

      <h3 className="text-center font-bold text-xl text-gray-800 mt-2 mb-4">
        Events on{" "}
        {selectedDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </h3>

      {selectedEvents.length === 0 ? (
        <p className="text-center text-gray-600">
          There are no events on this date.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100 text-gray-700 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left border-b border-gray-200 w-1/3">
                  Event Title
                </th>
                <th className="py-3 px-6 text-left border-b border-gray-200 w-1/2">
                  Time
                </th>
                <th className="py-3 px-6 text-center border-b border-gray-200 w-1/6">
                  Calendar
                </th>{" "}
                {/* Added Calendar column */}
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {selectedEvents.map((ev) => (
                <tr
                  key={ev.id}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="py-3 px-6 text-left whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="font-medium">{ev.title}</span>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-left">
                    {new Date(ev.start_time).toDateString() ===
                    new Date(ev.end_time).toDateString()
                      ? `${new Date(ev.start_time).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true, // Ensures AM/PM format
                        })} - ${new Date(ev.end_time).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true, // Ensures AM/PM format
                          }
                        )}`
                      : `${new Date(ev.start_time).toLocaleString("en-US", {
                          month: "2-digit",
                          day: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })} - ${new Date(ev.end_time).toLocaleString("en-US", {
                          month: "2-digit",
                          day: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}`}
                  </td>
                  <td className="py-3 px-6 text-center">
                    <span className="bg-blue-200 text-blue-800 py-1 px-3 rounded-full text-xs">
                      {ev.calendarTitle || "N/A"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MergedCalendar;
