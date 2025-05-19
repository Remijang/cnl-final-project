import { apiFetch } from "./api";

//Poll API
export const createPoll = (token, data) => apiFetch("/polls", "POST", token, data);
export const inviteUserPoll = (token, pollId, data) => apiFetch(`/polls/${pollId}/inviteUser`, "PUT", token, data);
export const inviteGroupPoll = (token, pollId, data) => apiFetch(`/polls/${pollId}/inviteGroupPoll`, "PUT", token, data);
export const listPoll = (token) => apiFetch("/polls/listPoll", "GET", token);
export const checkPoll = (token, pollId) => apiFetch(`/polls/${pollId}`, "GET", token);
export const votePoll = (token, pollId, data) => apiFetch(`/polls/${pollId}`, "POST", token, data);
export const updatePoll = (token, pollId, data) => apiFetch(`/polls/${pollId}`, "PUT", token, data);
export const getUserPoll = (token, pollId, userId) => apiFetch(`/polls/${pollId}/${userId}`, "GET", token);
export const confirmPoll = (token, pollId, data) => apiFetch(`/polls/${pollId}/confirm`, "POST", token, data);
export const cancelPoll = (token, pollId) => apiFetch(`/polls/${pollId}`, "DELETE", token);
