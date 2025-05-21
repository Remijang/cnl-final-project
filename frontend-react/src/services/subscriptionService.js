import { apiFetch } from "./api";

//Subscription API
export const subscribeCalendar = (token, calendar_id) =>
  apiFetch(`/subscriptions/${calendar_id}/subscribe`, "POST", token);
export const unsubscribeCalendar = (token, calendar_id) =>
  apiFetch(`/subscriptions/${calendar_id}/unsubscribe`, "POST", token);
