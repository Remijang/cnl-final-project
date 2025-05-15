const API_BASE = process.env.REACT_APP_API_URL;

export async function fetchCalendars(token) {
  const res = await fetch(`${API_BASE}/api/calendars`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}
