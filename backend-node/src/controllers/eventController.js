const pool = require("../config/db");
const calendarController = require("./calendarController");

exports.getEventsByCalendar = async (req, res) => {
  const { calendarId } = req.params;
  const userId = req.user.id;

  try {
    // Permission check
    if (!(await calendarController.calendarPermission(calendarId, userId))) {
      return res.status(403).json({ error: "Permission denied" });
    }

    const result = await pool.query(
      "SELECT id, title, start_time, end_time FROM events WHERE calendar_id = $1 ORDER BY start_time",
      [calendarId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createEvent = async (req, res) => {
  const { calendar_id, title, start_time, end_time } = req.body;
  const userId = req.user.id;

  if (!title || !start_time || !end_time) {
    return res.status(400).json({ error: "Miss some data column" });
  }

  try {
    if (!(await calendarController.calendarPermission(calendar_id, userId))) {
      return res.status(403).json({ error: "Permission denied" });
    }
    const result = await pool.query(
      "INSERT INTO events (calendar_id, title, start_time, end_time) VALUES ($1, $2, $3, $4) RETURNING id, title, start_time, end_time",
      [calendar_id, title, start_time, end_time]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateEvent = async (req, res) => {
  const { id } = req.params;
  const { title, start_time, end_time } = req.body;
  const userId = req.user.id;

  try {
    const calendarId = await findCalendarIdbyEventId(id);
    // Permission check
    if (!(await calendarController.calendarPermission(calendarId, userId))) {
      return res.status(403).json({ error: "Permission denied" });
    }
    const result = await pool.query(
      `
      UPDATE events 
      SET title = $1, start_time = $2, end_time = $3, updated_at = NOW()
      WHERE id = $4 
      RETURNING *
    `,
      [title, start_time, end_time, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Event not existing" });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteEvent = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    const calendarId = await findCalendarIdbyEventId(id);
    // Permission check
    if (!(await calendarController.calendarPermission(calendarId, userId))) {
      return res.status(403).json({ error: "Permission denied" });
    }
    await pool.query("DELETE FROM events WHERE id = $1", [id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

async function findCalendarIdbyEventId(eventId) {
  const result = await pool.query(
    "SELECT calendar_id FROM events WHERE id = $1",
    [eventId]
  );
  return result.rows[0].calendar_id;
}
