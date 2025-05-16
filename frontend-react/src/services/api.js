const API_BASE = process.env.REACT_APP_API_URL;

export async function fetchCalendars(token) {
  const res = await fetch(`${API_BASE}/api/calendars`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function apiFetch(endpoint, method = "GET", token = null, data = null) {
  const config = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "API 錯誤");
  }

  return result.data || result;
}

//Auth API
export const register = (data) => apiFetch("/auth/register", "POST", null, data);
export const login = (data) => apiFetch("/auth/login", "POST", null, data);
export const logout = (token) => apiFetch("/auth/logout", "POST", token);
export const getProfile = (token) => apiFetch("/users/profile", "GET", token);
export const updateProfile = (token, data) => apiFetch("/users/profile", "PUT", token, data);

//Calander API
export const getUserCalendar = (token) => apiFetch("/calendars/owned", "GET", token);
export const getAggregatedCalendar = (token) => apiFetch("/calendars/aggregated", "GET", token);
export const createCalendar = (token, data) => apiFetch("/calendars", "POST", token, data);
export const updateCalendar = (token, id, data) => apiFetch(`/calendars/${id}`, "PUT", token, data);
export const deleteCalendar = (token, id) => apiFetch(`/calendars/${id}`, "DELETE", token);

//Event API
export const getEventsByCalendar = (token, calendarId) => apiFetch(`/events/calendar/${calendarId}`, "GET", token);
export const createEvent = (token, data) => apiFetch("/events", "POST", token, data);
export const updateEvent = (token, id, data) => apiFetch(`/events/${id}`, "PUT", token, data);
export const deleteEvent = (token, id) => apiFetch(`/events/${id}`, "DELETE", token);

//Group API
export const createGroup = (token, data) => apiFetch("/groups", "POST", token, data);
export const getAllGroup = (token) => apiFetch("/groups", "GET", token);
export const getGroup = (token, groupId) => apiFetch(`/groups/${groupId}`, "GET", token);
export const addGroupUser = (token, groupId, addUserId) => apiFetch(`/groups/${groupId}/add`, "POST", token, { groupId, addUserId });
export const removeGroupUser = (token, groupId, addUserId) => apiFetch(`/groups/${groupId}/remove`, "POST", token, { groupId, addUserId });

//Subscription API
export const subscribeCalendar = (token, calendarId) => apiFetch(`/subscriptions/${calendarId}/subscribe`, "POST", token);
export const unsubscribeCalendar = (token, calendarId) => apiFetch(`/subscriptions/${calendarId}/unsubscribe`, "POST", token);

//AVailable API
export const setAvailability = (token, data) => apiFetch("/availability", "POST", token, data);
export const checkGroupAvailability = (token, groupId, day) => apiFetch(`/availability/group/${groupId}?day=${day}`, "GET", token);

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
