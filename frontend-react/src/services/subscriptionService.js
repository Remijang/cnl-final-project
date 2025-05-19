import { apiFetch } from "./api";

//Subscription API
export const subscribeCalendar = (token, calendarId) => apiFetch(`/subscriptions/${calendarId}/subscribe`, "POST", token);
export const unsubscribeCalendar = (token, calendarId) => apiFetch(`/subscriptions/${calendarId}/unsubscribe`, "POST", token);
