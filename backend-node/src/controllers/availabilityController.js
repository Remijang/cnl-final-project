const pool = require("../config/db");

exports.setAvailability = async (req, res) => {
  const userId = req.user.id;
  const { available_date, start_time, end_time } = req.body;
  try {
    // Insert new availability
    const result = await pool.query(
      `INSERT INTO user_availability (user_id, available_date, start_time, end_time)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, available_date, start_time, end_time]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.checkgroupAvailability = async (req, res) => {
  const { groupId } = req.params;
  const { day } = req.query;
  try {
    // Get all user_ids in the group
    const membersResult = await pool.query(
      "SELECT user_id FROM group_members WHERE group_id = $1",
      [groupId]
    );
    const userIds = membersResult.rows.map((row) => row.user_id);
    if (userIds.length === 0) {
      return res.json([]);
    }

    // Get all availabilities for these users on the given day
    const availResult = await pool.query(
      `SELECT user_id, available_date, start_time, end_time
       FROM user_availability
       WHERE user_id = ANY($1) AND available_date = $2
       ORDER BY start_time`,
      [userIds, day]
    );
    res.json(availResult.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
