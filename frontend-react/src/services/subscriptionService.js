import { apiFetch } from "./api";

//Subscription API
export const subscribeCalendar = (token, calendar_id) =>
  apiFetch(`/subscriptions/${calendar_id}`, "POST", token);
export const unsubscribeCalendar = (token, calendar_id) =>
  apiFetch(`/subscriptions/${calendar_id}`, "DELETE", token);
