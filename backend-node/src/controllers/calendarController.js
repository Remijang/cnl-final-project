const pool = require("../config/db");

exports.createCalendar = async (req, res) => {
  const { userId, title } = req.body;
  try {
    await pool.query(
      "INSERT INTO calendars (owner_id, title) VALUES ($1, $2)",
      [userId, title]
    );
    res.status(201).json({ message: "Calendar created" });
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
  throw new Error("Unimplemented!");
};

exports.updateCalendar = async (req, res) => {
  const { id: calendarId } = req.params;
  const { title } = req.body;
  const userId = req.user.id; // 假设用户身份已通过中间件验证

  try {
    // 1. 权限验证：用户需为拥有者或有写入权限
    const permissionCheck = await pool.query(
      `SELECT EXISTS(
        SELECT 1 FROM calendars 
        WHERE id = $1 AND owner_id = $2
        UNION
        SELECT 1 FROM calendar_shared_users 
        WHERE calendar_id = $1 AND user_id = $2 AND permission IN ('write', 'admin')
      ) AS has_permission`,
      [calendarId, userId]
    );

    if (!permissionCheck.rows[0].has_permission) {
      return res.status(403).json({ error: "Permission denied" });
    }

    // 2. 执行更新
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
  const { id: calendarId } = req.params;
  const userId = req.user.id;

  try {
    // permission check：only owner can delete
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

    // 2. 执行删除（CASCADE 会自动删除关联的 calendar_shared_users 记录）
    await pool.query("DELETE FROM calendars WHERE id = $1", [calendarId]);

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
