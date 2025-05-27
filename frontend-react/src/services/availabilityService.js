import { apiFetch } from "./api";

//AVailable API
export const setAvailability = (token, data) =>
  apiFetch("/availability", "POST", token, data);
export const checkGroupAvailability = (token, groupId, day) =>
  apiFetch(`/availability/groups/${groupId}?day=${day}`, "GET", token);
