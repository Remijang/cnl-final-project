import React, { useState, useEffect } from "react";
import {
  createEvent,
  deleteEvent,
  getEventsByCalendar,
} from "../services/eventService";

const EventManager = ({ token, calendar_id = 1 }) => {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const fetchEvents = async () => {
    try {
      const data = await getEventsByCalendar(token, calendar_id);
      setEvents(data);
    } catch (err) {
      console.error("Failed to load events", err);
    }
  };

  const handleCreateEvent = async () => {
    const toUTC = (localStr) => new Date(localStr).toISOString(); // local → UTC ISO

    await createEvent(token, {
      calendar_id: calendar_id,
      title: title,
      start_time: toUTC(startTime),
      end_time: toUTC(endTime),
    });

    setTitle("");
    setStartTime("");
    setEndTime("");
    fetchEvents();
  };

  const handleDeleteEvent = async (eventId) => {
    await deleteEvent(token, eventId);
    fetchEvents();
  };

  useEffect(() => {
    if (token) fetchEvents();
  }, [token, calendar_id]);

  return (
    <div>
      <h2>Events</h2>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
      />
      <input
        type="datetime-local"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
      />
      <input
        type="datetime-local"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
      />
      <button onClick={handleCreateEvent}>Create Event</button>
      <ul>
        {events.map((e) => (
          <li key={e.id}>
            <strong>{e.title}</strong> (
            {new Date(e.start_time).toLocaleString()} →{" "}
            {new Date(e.end_time).toLocaleString()})
            <button onClick={() => handleDeleteEvent(e.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EventManager;
