import { apiFetch } from "./api";

//Calander API
export const getUserCalendar = (token) =>
  apiFetch("/calendars/owned", "GET", token);
export const getAggregatedCalendar = (token) =>
  apiFetch("/calendars/aggregated", "GET", token);
export const createCalendar = (token, data) =>
  apiFetch("/calendars", "POST", token, data);
export const updateCalendar = (token, id, data) =>
  apiFetch(`/calendars/${id}`, "PUT", token, data);
export const deleteCalendar = (token, id) =>
  apiFetch(`/calendars/${id}`, "DELETE", token);
export const getVisibleCalendarByUsername = (token, username) =>
  apiFetch(`/calendars/user?name=${username}`, "GET", token);
export const getSubscribedCalendars = (token) =>
  apiFetch("/calendars/subscribed", "GET", token);
