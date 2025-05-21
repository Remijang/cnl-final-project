// 📁 src/services/permissionService.js
import { apiFetch } from "./api";

export const toggleVisibility = (token, calendar_id, on) =>
  apiFetch(
    `/permission/${calendar_id}/visibility/${on ? "on" : "off"}`,
    "POST",
    token
  );
export const toggleLinkEnable = (token, calendar_id, mode, on) =>
  apiFetch(
    `/permission/${calendar_id}/${mode}/${on ? "on" : "off"}`,
    "POST",
    token
  );
export const getLinkKey = (token, calendar_id, mode) =>
  apiFetch(`/permission/${calendar_id}/${mode}`, "GET", token);
export const claimPermissionWithKey = (token, calendar_id, mode, key) =>
  apiFetch(
    `/permission/${calendar_id}/${mode}/claim?key=${key}`,
    "POST",
    token
  );
export const removePermission = (token, calendar_id, userId) =>
  apiFetch(`/permission/${calendar_id}/remove/${userId}`, "DELETE", token);
