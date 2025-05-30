import { apiFetch } from "./api";

//Group API
export const createGroup = (token, data) =>
  apiFetch("/groups", "POST", token, data);
export const getAllGroup = (token) => apiFetch("/groups", "GET", token);
export const getGroup = (token, groupId) =>
  apiFetch(`/groups/${groupId}`, "GET", token);
export const addGroupUser = (token, groupId, addUserName) =>
  apiFetch(`/groups/${groupId}/user`, "POST", token, { addUserName });
export const removeGroupUser = (token, groupId, removeUserName) =>
  apiFetch(`/groups/${groupId}/user`, "DELETE", token, { removeUserName });
export const removeGroup = (token, groupId) =>
  apiFetch(`/groups/${groupId}`, "DELETE", token);
