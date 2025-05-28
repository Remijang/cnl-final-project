const pool = require("../config/db");
const permissionController = require("./permissionController");

const _unsubscribeCalendar = async (calendarId, removeUserId) => {
  const result = await pool.query(
    "DELETE FROM calendar_subscriptions WHERE user_id = ANY($1) AND calendar_id = $2 RETURNING user_id, calendar_id, subscribed_at",
    [removeUserId, calendarId]
  );
  return result.rows;
};

const _unsubscribeAllExcept = async (calendarId, remainUserId) => {
  const result = await pool.query(
    "DELETE FROM calendar_subscriptions WHERE user_id <> ALL($1) AND calendar_id = $2 RETURNING user_id, calendar_id, subscribed_at",
    [remainUserId, calendarId]
  );
  return result.rows;
};

exports.subscribeCalendar = async (req, res) => {
  const { calendarId } = req.params;
  try {
    const userId = req.user.id;
    const permissionCheck = await permissionController.permissionRead(
      calendarId,
      userId
    );
    if (permissionCheck === false) {
      return res.status(403).json({ error: "Permission denied" });
    }

    const ownerId = await pool.query(
      `SELECT owner_id FROM calendars WHERE id = $1`,
      [calendarId]
    );

    if (ownerId.rows[0].ownerId === userId) {
      return res.status(403).json({ error: "Permission denied" });
    }

    const check_if_exist = await pool.query(
      "SELECT user_id, calendar_id, subscribed_at FROM calendar_subscriptions WHERE user_id = $1 AND calendar_id = $2",
      [userId, calendarId]
    );

    if (check_if_exist.rows.length === 1) {
      return res
        .status(409)
        .json({ message: "User has already subscribed this calendar!" });
    }

    const result = await pool.query(
      "INSERT INTO calendar_subscriptions (user_id, calendar_id) VALUES ($1, $2) RETURNING user_id, calendar_id, subscribed_at",
      [userId, calendarId]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching subscription:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.unsubscribeCalendar = async (req, res) => {
  const { calendarId } = req.params;
  const userId = req.user.id;
  try {
    const result = await _unsubscribeCalendar(calendarId, [userId]);
    if (result.length === 0) {
      res.status(404).json({ error: "User does not subscribe the Calendar" });
    } else {
      res.status(200).json(result);
    }
  } catch (err) {
    console.error("Error fetching subscription:", err);
    res.status(500).json({ error: err.message });
  }
};

exports._unsubscribeCalendar = _unsubscribeCalendar;
exports._unsubscribeAllExcept = _unsubscribeAllExcept;

