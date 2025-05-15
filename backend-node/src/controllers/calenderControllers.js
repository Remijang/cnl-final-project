const pool = require("../config/db");

exports.createCalendar = async (req, res) => {
  const { userId, title, shared } = req.body;
  try {
    await pool.query(
      "INSERT INTO calendars (user_id, title, shared) VALUES ($1, $2, $3)",
      [userId, title, shared]
    );
    res.status(201).json({ message: "Calendar created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserCalendars = async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM calendars WHERE user_id = $1",
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
