const pool = require("../config/db");

exports.getEventsByCalendar = async (req, res) => {
  const { calendarId } = req.params;
  const userId = req.user.id;

  try {
    // Permission check
    const hasPermission = await pool.query(
      `SELECT 1 FROM calendars 
       WHERE id = $1 
       AND (owner_id = $2 OR EXISTS (
         SELECT 1 FROM calendar_shared_users 
         WHERE calendar_id = $1 AND user_id = $2
       ))`,
      [calendarId, userId]
    );

    if (hasPermission.rowCount === 0) {
      return res.status(403).json({ error: "Permission denied" });
    }

    const result = await pool.query(
      "SELECT id, title, start_time, end_time FROM events WHERE calendar_id = $1 ORDER BY start_time",
      [calendarId]
    );
    res.status(201).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Get fails", details: err.message });
  }
};

exports.createEvent = async (req, res) => {
  const { calendar_id, title, start_time, end_time } = req.body;
  const userId = req.user.id;

  if (!title || !start_time || !end_time) {
    return res.status(400).json({ error: "Miss some data column" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO events (calendar_id, title, start_time, end_time) VALUES ($1, $2, $3, $4) RETURNING id, title, start_time, end_time",
      [calendar_id, title, start_time, end_time]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Create fails", details: err.message });
  }
};

exports.updateEvent = async (req, res) => {
  const { id } = req.params;
  const { title, start_time, end_time } = req.body;
  const userId = req.user.id;
  try {
    // Permission check
    const result = await pool.query(
      `
      UPDATE events 
      SET title = $1, start_time = $2, end_time = $3, updated_at = NOW()
      FROM calendars
      WHERE events.id = $4 
        AND events.calendar_id = calendars.id
        AND (calendars.owner_id = $5 
             OR EXISTS (
               SELECT 1 FROM calendar_shared_users 
               WHERE calendar_id = calendars.id 
               AND user_id = $5 
               AND permission IN ('write')
             )
      RETURNING events.*
    `,
      [title, start_time, end_time, id, userId]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "Event not existing or permission denied" });
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Update fails", details: err.message });
  }
};

exports.deleteEvent = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM events WHERE id = $1", [id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: "Delete fails", details: err.message });
  }
};
