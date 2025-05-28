import React, { useState, useEffect, useCallback } from "react";
import {
  createEvent,
  deleteEvent,
  getEventsByCalendar,
} from "../services/eventService";
import { getUserCalendar } from "../services/calendarService";
// MergedCalendar is removed from here to avoid duplicated content.
// import MergedCalendar from "./MergedCalendar";

const EventManager = ({ token, calendar_id }) => {
  // calendar_id will be passed from parent
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" }); // State for custom messages

  // Note: `calendars` state and `fetchCalendars` are not strictly needed
  // within EventManager if its sole purpose is to manage events for a given `calendar_id`.
  // They are kept for now as they were in the original code, but could be removed
  // if `EventManager` is truly only for single calendar event management.
  const [calendars, setCalendars] = useState([]);

  const fetchEvents = useCallback(async () => {
    setMessage({ type: "", text: "" }); // Clear messages on new fetch
    if (!token || !calendar_id) {
      setMessage({
        type: "error",
        text: "Missing authentication token or calendar ID, unable to load events.",
      });
      return;
    }
    try {
      const data = await getEventsByCalendar(token, calendar_id);
      setEvents(data);
      if (data.length === 0) {
        setMessage({
          type: "info",
          text: "This calendar currently has no event.",
        });
      }
    } catch (err) {
      console.error("Failed to load events", err);
      setMessage({
        type: "error",
        text: `Failed to load events: ${err.message || "Unknown error"}`,
      });
    }
  }, [token, calendar_id]);

  const fetchCalendars = useCallback(async () => {
    // This function is likely redundant if EventManager is only for a specific calendar_id
    // and not for managing multiple calendars or their details.
    // Keeping it for now as per original code structure.
    try {
      const data = await getUserCalendar(token);
      setCalendars(data);
    } catch (err) {
      console.error("Failed to load calendars", err);
      // No specific message here as it's a secondary fetch
    }
  }, [token]);

  const handleCreateEvent = async () => {
    setMessage({ type: "", text: "" }); // Clear previous messages
    if (!title.trim() || !startTime || !endTime) {
      setMessage({ type: "error", text: "Please fill in all event fields." });
      return;
    }
    if (new Date(startTime) >= new Date(endTime)) {
      setMessage({
        type: "error",
        text: "Start time must be earlier than end time.",
      });
      return;
    }

    const toUTC = (localStr) => new Date(localStr).toISOString(); // local → UTC ISO

    try {
      await createEvent(token, {
        calendar_id: calendar_id,
        title: title.trim(),
        start_time: toUTC(startTime),
        end_time: toUTC(endTime),
      });
      setMessage({
        type: "success",
        text: `Event "${title}" created successfully!`,
      });
      setTitle("");
      setStartTime("");
      setEndTime("");
      fetchEvents(); // Refresh events list
    } catch (err) {
      console.error("Failed to create event", err);
      setMessage({
        type: "error",
        text: `Failed to create event: ${err.message || "Unknown error"}`,
      });
    }
  };

  const handleDeleteEvent = async (eventId) => {
    setMessage({ type: "", text: "" }); // Clear previous messages
    try {
      await deleteEvent(token, eventId);
      setMessage({ type: "success", text: "Event deleted successfully!" });
      fetchEvents(); // Refresh events list
    } catch (err) {
      console.error("Failed to delete event", err);
      setMessage({
        type: "error",
        text: `Failed to delete event: ${err.message || "Unknown error"}`,
      });
    }
  };

  useEffect(() => {
    if (token && calendar_id) {
      fetchEvents();
    } else {
      setEvents([]); // Clear events if no token or calendar_id
      setMessage({
        type: "info",
        text: "Please select a calendar to manage events.",
      });
    }
  }, [token, calendar_id, fetchEvents]); // Added fetchEvents to dependencies

  useEffect(() => {
    if (token) {
      fetchCalendars();
    }
  }, [token, fetchCalendars]); // Added fetchCalendars to dependencies

  return (
    <div className="space-y-6">
      {/* Message Box */}
      {message.text && (
        <div
          className={`p-3 mb-4 rounded-md text-sm text-center ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : message.type === "error"
              ? "bg-red-100 text-red-700"
              : "bg-blue-100 text-blue-700" // Info message style
          }`}
          role="alert"
        >
          {message.text}
        </div>
      )}

      {/* Create Event Form */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Create New Event
        </h3>
        <div className="flex flex-col space-y-4">
          <div>
            <label
              htmlFor="event-title"
              className="block text-sm font-bold text-gray-700 mb-1"
            >
              Title:
            </label>
            <input
              id="event-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title of the event"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
          </div>

          <div>
            <label
              htmlFor="start-time"
              className="block text-sm font-bold text-gray-700 mb-1"
            >
              Start Time:
            </label>
            <input
              id="start-time"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
          </div>

          <div>
            <label
              htmlFor="end-time"
              className="block text-sm font-bold text-gray-700 mb-1"
            >
              End Time:
            </label>
            <input
              id="end-time"
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
          </div>

          <button
            onClick={handleCreateEvent}
            className="bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700 transition duration-200 shadow-md self-center w-full sm:w-auto"
          >
            Create Event
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Event List</h3>
        {events.length === 0 && message.type !== "error" ? (
          <p className="text-gray-600">This calendar currently has no event.</p>
        ) : (
          <ul className="space-y-3">
            {events.map((event) => (
              <li
                key={event.id}
                className="bg-gray-50 p-4 rounded-md border border-gray-200 flex justify-between items-center shadow-sm"
              >
                <div>
                  <p className="font-semibold text-gray-800">{event.title}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(event.start_time).toLocaleString("en-US", {
                      year: "numeric",
                      month: "numeric",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true, // Use 12-hour format with AM/PM
                    })}{" "}
                    -{" "}
                    {new Date(event.end_time).toLocaleString("en-US", {
                      year: "numeric",
                      month: "numeric",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true, // Use 12-hour format with AM/PM
                    })}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteEvent(event.id)}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition duration-200 shadow-sm"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* MergedCalendar is intentionally removed from here */}
    </div>
  );
};

export default EventManager;
