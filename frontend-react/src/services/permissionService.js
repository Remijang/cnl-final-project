// 📁 src/services/permissionService.js
import { apiFetch } from "./api";

export const toggleVisibility = (token, calendarId, on) =>
  apiFetch(
    `/permission/${calendarId}/visibility/${on ? "on" : "off"}`,
    "POST",
    token
  );
export const toggleLinkEnable = (token, calendarId, mode, on) =>
  apiFetch(
    `/permission/${calendarId}/${mode}/${on ? "on" : "off"}`,
    "POST",
    token
  );
export const getLinkKey = (token, calendarId, mode) =>
  apiFetch(`/permission/${calendarId}/${mode}`, "GET", token);
export const claimPermissionWithKey = (token, calendarId, mode, key) =>
  apiFetch(`/permission/${calendarId}/${mode}/claim?key=${key}`, "POST", token);
export const removeReadPermission = (token, calendarId, userId) =>
  apiFetch(`/permission/${calendarId}/read/${userId}`, "DELETE", token);
export const removeWritePermission = (token, calendarId, userId) =>
  apiFetch(`/permission/${calendarId}/write/${userId}`, "DELETE", token);
