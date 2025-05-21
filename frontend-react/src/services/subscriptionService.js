import { apiFetch } from "./api";

//Subscription API
export const subscribeCalendar = (token, calendarId) =>
  apiFetch(`/subscriptions/${calendarId}`, "POST", token);
export const unsubscribeCalendar = (token, calendarId) =>
  apiFetch(`/subscriptions/${calendarId}`, "DELETE", token);
