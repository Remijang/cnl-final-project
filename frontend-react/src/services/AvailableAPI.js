//AVailable API
export const setAvailability = (token, data) => apiFetch("/availability", "POST", token, data);
export const checkGroupAvailability = (token, groupId, day) => apiFetch(`/availability/group/${groupId}?day=${day}`, "GET", token);
