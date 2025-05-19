//Group API
export const createGroup = (token, data) => apiFetch("/groups", "POST", token, data);
export const getAllGroup = (token) => apiFetch("/groups", "GET", token);
export const getGroup = (token, groupId) => apiFetch(`/groups/${groupId}`, "GET", token);
export const addGroupUser = (token, groupId, addUserId) => apiFetch(`/groups/${groupId}/add`, "POST", token, { groupId, addUserId });
export const removeGroupUser = (token, groupId, addUserId) => apiFetch(`/groups/${groupId}/remove`, "POST", token, { groupId, addUserId });
