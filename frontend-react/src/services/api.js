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

  const response = await fetch(`${API_BASE}/api${endpoint}`, config);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "API 錯誤");
  }

  return result.data || result;
}
