const pool = require("../config/db");
const votePoll = async (req, res) => {
  const { pollId } = req.params;
  const userId = req.user.id;
  const { votes } = req.body;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const pollCheck = await client.query("SELECT id FROM polls WHERE id = $1", [
      pollId,
    ]);
    if (pollCheck.rowCount === 0) {
      return res.status(404).json({ error: "Poll not found" });
    }

    const timeRangeIds = votes.map((v) => v.time_range_id);
    const timeRangeCheck = await client.query(
      `SELECT id FROM poll_time_ranges WHERE poll_id = $1 AND id = ANY($2::int[])`,
      [pollId, timeRangeIds]
    );

    if (timeRangeCheck.rowCount !== timeRangeIds.length) {
      return res
        .status(400)
        .json({ error: "One or more time ranges are invalid for this poll" });
    }

    const voteResults = [];

    for (const vote of votes) {
      const result = await client.query(
        `INSERT INTO poll_votes (poll_id, time_range_id, user_id, is_available)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (poll_id, time_range_id, user_id)
           DO UPDATE SET is_available = EXCLUDED.is_available, voted_at = NOW()
           RETURNING *`,
        [pollId, vote.time_range_id, userId, vote.is_available]
      );
      voteResults.push(result.rows[0]);
    }

    await client.query("COMMIT");
    res.status(201).json({ votes: voteResults });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

exports.createPoll = async (req, res) => {
  const { title, description, time_ranges } = req.body;
  const ownerId = req.user.id;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    if (!title) return res.status(400).json({ error: "Title is required" });

    const pollResult = await client.query(
      `INSERT INTO polls (title, description, owner_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [title, description, ownerId]
    );

    const pollId = pollResult.rows[0].id;

    const time_range_results = [];
    for (const range of time_ranges) {
      const time_range_result = await client.query(
        `INSERT INTO poll_time_ranges (poll_id, start_time, end_time)
         VALUES ($1, $2, $3)
         RETURNING id, start_time, end_time`,
        [pollId, range.start_time, range.end_time]
      );
      time_range_results.push(time_range_result.rows[0]);
    }

    await client.query("COMMIT");

    res
      .status(201)
      .json({ poll: pollResult.rows[0], time_ranges: time_range_results });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

exports.inviteUserPoll = async (req, res) => {
  const { pollId } = req.params;
  const { userId } = req.body;
  const ownerId = req.user.id;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const pollCheck = await client.query(
      "SELECT owner_id FROM polls WHERE id = $1",
      [pollId]
    );
    if (pollCheck.rowCount === 0)
      return res.status(404).json({ error: "Poll not found" });
    if (pollCheck.rows[0].owner_id !== ownerId)
      return res.status(403).json({ error: "Permission denied" });

    const userCheck = await client.query("SELECT id FROM users WHERE id = $1", [
      userId,
    ]);
    if (userCheck.rowCount === 0)
      return res.status(404).json({ error: "User not found" });

    const inviteResult = await client.query(
      `INSERT INTO poll_invited_users (poll_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (poll_id, user_id) DO NOTHING
       RETURNING *`,
      [pollId, userId]
    );

    await client.query("COMMIT");

    if (inviteResult.rowCount === 0)
      return res.status(200).json({ message: "User already invited" });

    res.status(201).json(inviteResult.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

exports.inviteGroupPoll = async (req, res) => {
  const { pollId } = req.params;
  const { groupId } = req.body;
  const ownerId = req.user.id;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const pollCheck = await client.query(
      "SELECT owner_id FROM polls WHERE id = $1",
      [pollId]
    );

    if (pollCheck.rowCount === 0)
      return res.status(404).json({ error: "Poll not found" });
    if (pollCheck.rows[0].owner_id !== ownerId)
      return res.status(403).json({ error: "Permission denied" });

    const groupCheck = await client.query(
      "SELECT owner_id FROM groups WHERE id = $1",
      [groupId]
    );

    if (groupCheck.rowCount === 0)
      return res.status(404).json({ error: "Group not found" });

    // Need to be group owner to invite?
    if (groupCheck.rows[0].owner_id !== ownerId)
      return res.status(403).json({ error: "Permission denied" });

    const inviteResult = await client.query(
      `INSERT INTO poll_invited_users (poll_id, user_id)
       SELECT $1, user_id FROM group_members WHERE group_id = $2
       ON CONFLICT (poll_id, user_id) DO NOTHING
       RETURNING user_id`,
      [pollId, groupId]
    );

    await client.query("COMMIT");

    if (inviteResult.rowCount === 0)
      return res.status(200).json({ message: "No new users invited" });
    res.status(201).json(inviteResult.rows);
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

exports.listPoll = async (_, res) => {
  try {
    // Should list polls that already confirmed?
    const result = await pool.query(
      "SELECT * FROM polls WHERE is_cancelled = FALSE AND is_confirmed = FALSE ORDER BY created_at DESC"
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.checkPoll = async (req, res) => {
  const { pollId } = req.params;

  try {
    const pollResult = await pool.query(
      `SELECT * FROM polls WHERE id = $1 AND is_cancelled = FALSE`,
      [pollId]
    );

    if (pollResult.rowCount === 0)
      return res.status(404).json({ error: "Poll not found" });

    const timeRangesResult = await pool.query(
      `SELECT tr.*, 
       COUNT(v.user_id) FILTER (WHERE v.is_available) AS available_count
       FROM poll_time_ranges tr
       LEFT JOIN poll_votes v ON tr.id = v.time_range_id
       WHERE tr.poll_id = $1
       GROUP BY tr.id
       ORDER BY tr.start_time ASC`,
      [pollId]
    );

    res.status(200).json({
      poll: pollResult.rows[0],
      time_ranges: timeRangesResult.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.votePoll = votePoll;

exports.updatePoll = votePoll;

exports.getUserPoll = async (req, res) => {
  const { pollId, userId } = req.params;

  try {
    const pollCheck = await pool.query("SELECT id FROM polls WHERE id = $1", [
      pollId,
    ]);
    if (pollCheck.rowCount === 0) {
      return res.status(404).json({ error: "Poll not found" });
    }

    const userCheck = await pool.query("SELECT id FROM users WHERE id = $1", [
      userId,
    ]);
    if (userCheck.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const result = await pool.query(
      `SELECT v.*, tr.start_time, tr.end_time
       FROM poll_votes v
       JOIN poll_time_ranges tr ON v.time_range_id = tr.id
       WHERE v.poll_id = $1 AND v.user_id = $2`,
      [pollId, userId]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.confirmPoll = async (req, res) => {
  const { pollId } = req.params;
  const { confirmed_time_range_id } = req.body;
  const ownerId = req.user.id;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const pollCheck = await client.query(
      "SELECT owner_id FROM polls WHERE id = $1",
      [pollId]
    );

    if (pollCheck.rowCount === 0)
      return res.status(404).json({ error: "Poll not found" });
    if (pollCheck.rows[0].owner_id !== ownerId)
      return res.status(403).json({ error: "Permission denied" });

    const timeRangeResult = await client.query(
      `SELECT start_time, end_time 
       FROM poll_time_ranges 
       WHERE id = $1 AND poll_id = $2`,
      [confirmed_time_range_id, pollId]
    );

    if (timeRangeResult.rowCount === 0)
      return res
        .status(404)
        .json({ error: "Time range not found in this poll" });

    const pollResult = await client.query(
      `UPDATE polls SET is_confirmed = TRUE, confirmed_time_range_id = $1 
       WHERE id = $2
       RETURNING *`,
      [confirmed_time_range_id, pollId]
    );

    await client.query("COMMIT");
    res.status(200).json(pollResult.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

exports.cancelPoll = async (req, res) => {
  const { pollId } = req.params;
  const ownerId = req.user.id;

  try {
    const pollCheck = await pool.query(
      "SELECT owner_id FROM polls WHERE id = $1",
      [pollId]
    );

    if (pollCheck.rowCount === 0)
      return res.status(404).json({ error: "Poll not found" });
    if (pollCheck.rows[0].owner_id !== ownerId)
      return res.status(403).json({ error: "Permission denied" });

    const cancelResult = await pool.query(
      `UPDATE polls 
       SET is_cancelled = TRUE 
       WHERE id = $1
       RETURNING *`,
      [pollId]
    );

    res.status(200).json(cancelResult.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
