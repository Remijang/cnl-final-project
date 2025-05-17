const pool = require("../config/db");

exports.createCalendar = async (req, res) => {
  const { title } = req.body;
  const ownerId = req.user.id;
  try {
    const result = await pool.query(
      `INSERT INTO calendars (owner_id, title) 
       VALUES ($1, $2) 
       RETURNING id, title, created_at, updated_at`,
      [ownerId, title]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserCalendar = async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM calendars WHERE owner_id = $1",
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAggregatedCalendar = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * 
      FROM calendars
      ORDER BY created_at DESC
    `);

    res.json({
      count: result.rowCount,
      calendars: result.rows,
    });
  } catch (err) {
    res.status(500).json({
      error: "取得日曆資料失敗",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

exports.updateCalendar = async (req, res) => {
  const { id: calendarId } = req.params;
  const { title } = req.body;
  const userId = req.user.id;

  try {
    // Permission check： owner or has write permission
    const permissionCheck = await pool.query(
      `SELECT EXISTS(
        SELECT 1 FROM calendars 
        WHERE id = $1 AND owner_id = $2
        UNION
        SELECT 1 FROM calendar_shared_users 
        WHERE calendar_id = $1 AND user_id = $2 AND permission IN ('write')
      ) AS has_permission`,
      [calendarId, userId]
    );

    if (!permissionCheck.rows[0].has_permission) {
      return res.status(403).json({ error: "Permission denied" });
    }

    // Update timestamp and title
    const result = await pool.query(
      "UPDATE calendars SET title = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
      [title, calendarId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Calendar not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteCalendar = async (req, res) => {
  const { id: calendarId } = req.params; // store in new variable calendarId
  const userId = req.user.id;

  try {
    // Permission check：only owner can delete
    const ownershipCheck = await pool.query(
      "SELECT owner_id FROM calendars WHERE id = $1",
      [calendarId]
    );

    if (ownershipCheck.rowCount === 0) {
      return res.status(404).json({ error: "Calendar not found" });
    }

    if (ownershipCheck.rows[0].owner_id !== userId) {
      return res.status(403).json({ error: "Permission denied" });
    }

    // CASCADE automactically delete related calendar_shared_users record
    await pool.query("DELETE FROM calendars WHERE id = $1", [calendarId]);

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
