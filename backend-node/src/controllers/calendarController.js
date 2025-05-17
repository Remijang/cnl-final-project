const pool = require("../config/db");

exports.createCalendar = async (req, res) => {
  const { userId, title } = req.body;
  try {
    await pool.query("INSERT INTO calendars (user_id, title) VALUES ($1, $2)", [
      userId,
      title,
    ]);
    res.status(201).json({ message: "Calendar created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserCalendar = async (req, res) => {
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

exports.getAggregatedCalendar = async (req, res) => {
  throw new Error("Unimplemented!");
};

exports.updateCalendar = async (req, res) => {
  throw new Error("Unimplemented!");
};

exports.deleteCalendar = async (req, res) => {
  throw new Error("Unimplemented!");
};
