//Event API
export const getEventsByCalendar = (token, calendarId) => apiFetch(`/events/calendar/${calendarId}`, "GET", token);
export const createEvent = (token, data) => apiFetch("/events", "POST", token, data);
export const updateEvent = (token, id, data) => apiFetch(`/events/${id}`, "PUT", token, data);
export const deleteEvent = (token, id) => apiFetch(`/events/${id}`, "DELETE", token);