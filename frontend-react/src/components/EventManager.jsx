import React, { useState, useEffect } from "react";

const EventManager = ({ token }) => {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const fetchEvents = async () => {
    const res = await fetch("http://localhost:3000/api/events/1", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setEvents(data);
  };

  const createEvent = async () => {
    await fetch("http://localhost:3000/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        calendarId: 1,
        title,
        start_time: startTime,
        end_time: endTime,
      }),
    });
    setTitle("");
    setStartTime("");
    setEndTime("");
    fetchEvents();
  };

  const deleteEvent = async (eventId) => {
    await fetch(`http://localhost:3000/api/events/${eventId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchEvents();
  };

  useEffect(() => {
    fetchEvents();
  }, []);

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
      <button onClick={createEvent}>Create Event</button>
      <ul>
        {events.map((e) => (
          <li key={e.id}>
            <strong>{e.title}</strong> ({e.start_time} → {e.end_time})
            <button onClick={() => deleteEvent(e.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EventManager;
