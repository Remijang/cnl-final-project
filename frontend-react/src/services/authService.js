import { apiFetch } from "./api";

//Auth API
export const register = (data) =>
  apiFetch("/auth/register", "POST", null, data);
export const login = (data) => apiFetch("/auth/login", "POST", null, data);
export const logout = (token) => apiFetch("/auth/logout", "POST", token);
export const getProfile = (token) => apiFetch("/users/profile", "GET", token);
export const updateProfile = (token, data) =>
  apiFetch("/users/profile", "PUT", token, data);
