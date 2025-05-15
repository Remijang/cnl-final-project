const pool = require("../config/db");

exports.getEventsByCalendar = async (req, res) => {
  const { calendarId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM events WHERE calendar_id = $1 ORDER BY start_time",
      [calendarId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createEvent = async (req, res) => {
  const { calendarId, title, start_time, end_time } = req.body;
  try {
    await pool.query(
      "INSERT INTO events (calendar_id, title, start_time, end_time) VALUES ($1, $2, $3, $4)",
      [calendarId, title, start_time, end_time]
    );
    res.status(201).json({ message: "Event created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteEvent = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM events WHERE id = $1", [id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
