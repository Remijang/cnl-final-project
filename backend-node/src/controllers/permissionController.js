const pool = require("../config/db");

exports.visibilityOn = async (req, res) => {
  const { calendarId } = req.params;
  const userId = req.user.id;
  try {
    const ownershipCheck = await pool.query(
      `SELECT owner_id 
      FROM calendars 
      WHERE id = $1`,
      [calendarId]
    );

    if (ownershipCheck.rowCount === 0) {
      return res.status(404).json({ error: "Calendar not found" });
    }
    if (ownershipCheck.rows[0].owner_id !== userId) {
      return res.status(403).json({ error: "Permission denied" });
    }

    const result = await pool.query(
      `UPDATE calendars 
      SET visibility = TRUE, updated_at = NOW() 
      WHERE id = $1 
      RETURNING id, visibility`,
      [calendarId]
    );

    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.visibilityOff = async (req, res) => {
  const { calendarId } = req.params;
  const userId = req.user.id;
  try {
    const ownershipCheck = await pool.query(
      `SELECT owner_id 
      FROM calendars 
      WHERE id = $1`,
      [calendarId]
    );

    if (ownershipCheck.rowCount === 0) {
      return res.status(404).json({ error: "Calendar not found" });
    }
    if (ownershipCheck.rows[0].owner_id !== userId) {
      return res.status(403).json({ error: "Permission denied" });
    }

    const result = await pool.query(
      `UPDATE calendars 
      SET visibility = FALSE, updated_at = NOW() 
      WHERE id = $1 
      RETURNING id, visibility`,
      [calendarId]
    );

    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.readLinkOn = async (req, res) => {
  const { calendarId } = req.params;
  const userId = req.user.id;
  try {
    const ownershipCheck = await pool.query(
      `SELECT owner_id 
      FROM calendars 
      WHERE id = $1`,
      [calendarId]
    );

    if (ownershipCheck.rowCount === 0) {
      return res.status(404).json({ error: "Calendar not found" });
    }
    if (ownershipCheck.rows[0].owner_id !== userId) {
      return res.status(403).json({ error: "Permission denied" });
    }

    const result = await pool.query(
      `UPDATE calendars 
      SET read_link_enable = TRUE, updated_at = NOW() 
      WHERE id = $1 
      RETURNING id, read_link_enable`,
      [calendarId]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.readLinkOff = async (req, res) => {
  const { calendarId } = req.params;
  const userId = req.user.id;
  try {
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

    const result = await pool.query(
      `UPDATE calendars 
      SET read_link_enable = FALSE, updated_at = NOW() 
      WHERE id = $1 
      RETURNING id, read_link_enable`,
      [calendarId]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.writeLinkOn = async (req, res) => {
  const { calendarId } = req.params;
  const userId = req.user.id;
  try {
    const ownershipCheck = await pool.query(
      `SELECT owner_id 
      FROM calendars 
      WHERE id = $1`,
      [calendarId]
    );

    if (ownershipCheck.rowCount === 0) {
      return res.status(404).json({ error: "Calendar not found" });
    }
    if (ownershipCheck.rows[0].owner_id !== userId) {
      return res.status(403).json({ error: "Permission denied" });
    }

    const result = await pool.query(
      `UPDATE calendars 
      SET write_link_enable = TRUE, updated_at = NOW() 
      WHERE id = $1 
      RETURNING id, write_link_enable`,
      [calendarId]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.writeLinkOff = async (req, res) => {
  const { calendarId } = req.params;
  const userId = req.user.id;
  try {
    const ownershipCheck = await pool.query(
      `SELECT owner_id 
      FROM calendars 
      WHERE id = $1`,
      [calendarId]
    );

    if (ownershipCheck.rowCount === 0) {
      return res.status(404).json({ error: "Calendar not found" });
    }
    if (ownershipCheck.rows[0].owner_id !== userId) {
      return res.status(403).json({ error: "Permission denied" });
    }

    const result = await pool.query(
      `UPDATE calendars 
      SET write_link_enable = FALSE, updated_at = NOW() 
      WHERE id = $1 
      RETURNING id, write_link_enable`,
      [calendarId]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.claimReadPermission = async (req, res) => {
  const { calendarId, key } = req.query;
  const userId = req.user.id;
  try {
    const keyCheck = await pool.query(
      `SELECT id, read_link_enable 
      FROM calendars 
      WHERE read_link = $1`,
      [key]
    );

    if (keyCheck.rowCount === 0) {
      return res.status(404).json({ error: "Calendar not found" });
    }
    if (keyCheck.rows[0].id.toString() !== calendarId) {
      return res
        .status(400)
        .json({ error: "Invalid calendar ID for the provided key" });
    }
    if (keyCheck.rows[0].read_link_enable !== true) {
      return res.status(403).json({ error: "Permission denied" });
    }

    const existCheck = await pool.query(
      `SELECT permission
      FROM calendar_shared_users 
      WHERE calendar_id = $1 and user_id = $2`,
      [calendarId, userId]
    );

    let query;
    let queryParams = [];

    if (existCheck.rowCount === 0) {
      query = `
        INSERT INTO calendar_shared_users (calendar_id, user_id, permission) 
        VALUES ($1, $2, 'read') 
        RETURNING calendar_id, user_id, permission
      `;
    } else {
      query = `
        SELECT calendar_id, user_id, permission 
        FROM calendar_shared_users
        WHERE calendar_id = $1 and user_id = $2
      `;
    }
    queryParams = [calendarId, userId];
    const result = await pool.query(query, queryParams);

    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.claimWritePermission = async (req, res) => {
  const { calendarId, key } = req.query;
  const userId = req.user.id;
  try {
    const keyCheck = await pool.query(
      `SELECT id, write_link_enable 
      FROM calendars 
      WHERE write_link = $1`,
      [key]
    );

    if (keyCheck.rowCount === 0) {
      return res.status(404).json({ error: "Calendar not found" });
    }
    if (keyCheck.rows[0].id.toString() !== calendarId) {
      return res
        .status(400)
        .json({ error: "Invalid calendar ID for the provided key" });
    }
    if (keyCheck.rows[0].write_link_enable !== true) {
      return res.status(403).json({ error: "Permission denied" });
    }

    const existCheck = await pool.query(
      `SELECT permission
      FROM calendar_shared_users 
      WHERE calendar_id = $1 and user_id = $2`,
      [calendarId, userId]
    );

    let query;
    let queryParams = [];

    if (existCheck.rowCount === 0) {
      query = `
        INSERT INTO calendar_shared_users (calendar_id, user_id, permission) 
        VALUES ($1, $2, 'write') 
        RETURNING calendar_id, user_id, permission
      `;
    } else if (existCheck.row[0].permission === "read") {
      query = `
      UPDATE calendar_shared_users
      SET permission = 'write'
      WHERE calendar_id = $1 and user_id = $2
      RETURNING calendar_id, user_id, permission
      `;
    } else {
      query = `
        SELECT calendar_id, user_id, permission 
        FROM calendar_shared_users
        WHERE calendar_id = $1 and user_id = $2
      `;
    }
    queryParams = [calendarId, userId];
    const result = await pool.query(query, queryParams);

    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removePermission = async (req, res) => {
  const { calendarId, removeUserId } = req.params;
  const userId = req.user.id;
  try {
    const ownershipCheck = await pool.query(
      `SELECT owner_id 
      FROM calendars 
      WHERE id = $1`,
      [calendarId]
    );

    if (ownershipCheck.rowCount === 0) {
      return res.status(404).json({ error: "Calendar not found" });
    }
    if (ownershipCheck.rows[0].owner_id !== userId) {
      return res.status(403).json({ error: "Permission denied" });
    }

    const existCheck = await pool.query(
      `SELECT 1
      FROM calendar_shared_users 
      WHERE calendar_id = $1 and user_id = $2`,
      [calendarId, userId]
    );

    if (existCheck.rowCount === 0) {
      return res.status(404).json({ error: "Permission not found" });
    }

    const result = await pool.query(
      `DELETE 
      FROM calendar_shared_users 
      WHERE calendar_id = $1 and user_id = $2
      RETURNING calendar_id, user_id, permission`,
      [calendarId, removeUserId]
    );

    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.permissionRead = async (calendarId, userId) => {
  // Owner, shared user with read or write permission
  const permissionCheck = await pool.query(
    `SELECT EXISTS(
      SELECT 1 FROM calendars 
      WHERE id = $1 AND owner_id = $2
      UNION
      SELECT 1 FROM calendar_shared_users 
      WHERE calendar_id = $1 AND user_id = $2 AND permission IN ('read', 'write')
    ) AS has_permission`,
    [calendarId, userId]
  );
  return permissionCheck.rows[0].has_permission;
};

exports.permissionWrite = async (calendarId, userId) => {
  // Owner, shared user with write permission
  const permissionCheck = await pool.query(
    `SELECT EXISTS(
      SELECT 1 FROM calendars 
      WHERE id = $1 AND owner_id = $2
      UNION
      SELECT 1 FROM calendar_shared_users 
      WHERE calendar_id = $1 AND user_id = $2 AND permission = 'write'
    ) AS has_permission`,
    [calendarId, userId]
  );
  return permissionCheck.rows[0].has_permission;
};
