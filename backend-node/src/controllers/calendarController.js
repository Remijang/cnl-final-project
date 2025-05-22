const pool = require("../config/db");
const permissionController = require("./permissionController");
const userController = require("./userController");

function createRandomString(length) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

exports.createCalendar = async (req, res) => {
  const { title } = req.body;
  const ownerId = req.user.id;
  try {
    read_link = createRandomString(32);
    write_link = createRandomString(32);
    const result = await pool.query(
      `INSERT INTO calendars (owner_id, title, read_link, write_link) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, title, visibility, 
       read_link, read_link_enable, 
       write_link, write_link_enable, 
       created_at, updated_at`,
      [ownerId, title, read_link, write_link]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserCalendar = async (req, res) => {
  const ownerId = req.user.id;
  try {
    const result = await pool.query(
      `SELECT * FROM calendars WHERE owner_id = $1`,
      [ownerId]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getVisibleCalendarByUsername = async (req, res) => {
  const { name } = req.query;

  try {
    const id = await userController._getIdByName(name);
    console.log(
      "try to get calendar by username, id: ",
      id,
      ", username: ",
      name
    );
    const result = await pool.query(
      `SELECT *
        FROM calendars 
        WHERE visibility = TRUE AND owner_id = $1
    
        UNION
        
        SELECT c.*
        FROM calendars c
        JOIN calendar_shared_users csu ON c.id = csu.calendar_id
        WHERE csu.user_id = $1 AND csu.permission = 'read'
        ORDER BY created_at DESC;
    `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Calendar not found" });
    }

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSubscribedCalendar = async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      `
    SELECT * FROM calendars WHERE owner_id = $1
      
    UNION
      
    SELECT c.*
    FROM calendars c
    WHERE c.owner_id = $1
       
    UNION

    SELECT c.*
    FROM calendars c
    JOIN calendar_subscriptions cs ON c.id = cs.calendar_id
    WHERE cs.user_id = $1
  `,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAggregatedCalendar = async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      `
    SELECT * FROM calendars WHERE owner_id = $1

    UNION

    SELECT *
    FROM calendars 
    WHERE visibility = TRUE

    UNION
    
    SELECT c.*
    FROM calendars c
    JOIN calendar_shared_users csu ON c.id = csu.calendar_id
    WHERE csu.user_id = $1 AND csu.permission = 'read'
    ORDER BY created_at DESC;
  `,
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch calendars.", details: err.message });
  }
};

exports.updateCalendar = async (req, res) => {
  const { calendarId } = req.params;
  const { title } = req.body;
  const userId = req.user.id;

  try {
    // Write permission check
    if (!(await permissionController.permissionWrite(calendarId, userId))) {
      return res.status(403).json({ error: "Permission denied" });
    }

    // Update timestamp and title
    const result = await pool.query(
      "UPDATE calendars SET title = $1, updated_at = NOW() WHERE id = $2 RETURNING id, title",
      [title, calendarId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Calendar not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteCalendar = async (req, res) => {
  const { calendarId } = req.params; // store in new variable calendarId
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
    const result = await pool.query(
      `DELETE 
      FROM calendars 
      WHERE id = $1 
      RETURNING id, title`,
      [calendarId]
    );

    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
