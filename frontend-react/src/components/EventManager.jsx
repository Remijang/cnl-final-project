import React, { useState, useEffect } from "react";
import {
  createEvent,
  deleteEvent,
  getEventsByCalendar,
} from "../services/eventService";
import { getUserCalendar } from "../services/calendarService";
import MergedCalendar from "./MergedCalendar";

const EventManager = ({ token, calendar_id = 1 }) => {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [calendars, setCalendars] = useState([]);

  const fetchEvents = async () => {
    try {
      const data = await getEventsByCalendar(token, calendar_id);
      setEvents(data);
    } catch (err) {
      console.error("Failed to load events", err);
    }
  };

  const fetchCalendars = async () => {
    try {
      const data = await getUserCalendar(token);
      setCalendars(data);
    } catch (err) {
      console.error("Failed to load calendar", err);
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

  useEffect(() => {
    if (token) fetchCalendars();
    console.log("Calendars:", calendars);
  }, [token]);

  return (
    <div className="flex flex-col space-y-4 max-w-md mb-6">
      <div className="flex items-center space-x-2">
        <label className="font-bold">Title:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter title of event"
          className="flex-1 p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="flex items-center space-x-2">
        <label className="font-bold">Start time:</label>
        <input
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="flex-1 p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="flex items-center space-x-2">
        <label className="font-bold">End time:</label>
        <input
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="flex-1 p-2 border border-gray-300 rounded-md"
        />
      </div>

      <button
        onClick={handleCreateEvent}
        className="bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700 transition mx-auto w-auto"
      >
        Create Event
      </button>

      <MergedCalendar
        token={token}
        myCalendars={[]}
        subscribedCalendars={calendars.filter((cal) => cal.id === calendar_id)}
      />
      <h2>Events</h2>
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
