const pool = require("../config/db");

// Create a new group
exports.createGroup = async (req, res) => {
  const { name } = req.body;
  const ownerId = req.user.id;
  try {
    const result = await pool.query(
      "INSERT INTO groups (name, owner_id) VALUES ($1, $2) RETURNING *",
      [name, ownerId]
    );
    // Add owner as a member
    await pool.query(
      "INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)",
      [result.rows[0].id, ownerId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all groups the user is a member of
exports.getAllGroup = async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      `SELECT g.* FROM groups g
       JOIN group_members gm ON g.id = gm.group_id
       WHERE gm.user_id = $1`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add a user to a group (only owner can add)
exports.addGroupUser = async (req, res) => {
  const { groupId } = req.params;
  const { addUserName } = req.body;
  const userId = req.user.id;
  try {
    // Check ownership
    const group = await pool.query(
      "SELECT owner_id FROM groups WHERE id = $1",
      [groupId]
    );
    if (!group.rows.length || group.rows[0].owner_id !== userId) {
      return res.status(403).json({ error: "Permission denied" });
    }
    // Check user exist
    const addUserIdRes = await pool.query(
      "SELECT id FROM users WHERE name = $1",
      [addUserName]
    );
    if (!addUserIdRes.rows.length) {
      return res.status(404).json({ error: "User not found" });
    }
    const addUserId = addUserIdRes.rows[0].id;
    // Check user in group
    const exist = await pool.query(
      "SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2",
      [groupId, addUserId]
    );
    if (exist.rows.length) {
      return res.status(409).json({ error: "User already in this group" });
    }
    // Add member
    await pool.query(
      "INSERT INTO group_members (group_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [groupId, addUserId]
    );
    res.status(200).json({ message: "User added to group" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Remove a user from a group (only owner can remove)
exports.removeGroupUser = async (req, res) => {
  const { groupId } = req.params;
  const { removeUserName } = req.body;
  const userId = req.user.id;
  try {
    // Check ownership
    const group = await pool.query(
      "SELECT owner_id FROM groups WHERE id = $1",
      [groupId]
    );
    if (!group.rows.length || group.rows[0].owner_id !== userId) {
      return res.status(403).json({ error: "Permission denied" });
    }
    // Check user exist
    const removeUserIdRes = await pool.query(
      "SELECT id FROM users WHERE name = $1",
      [removeUserName]
    );
    if (!removeUserIdRes.rows.length) {
      return res.status(404).json({ error: "User not found" });
    }
    const removeUserId = removeUserIdRes.rows[0].id;
    // Check user in group
    const exist = await pool.query(
      "SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2",
      [groupId, removeUserId]
    );
    if (!exist.rows.length) {
      return res.status(404).json({ error: "User not in group" });
    }
    // Check if user is owner
    if (userId === removeUserId) {
      return res
        .status(401)
        .json({ error: "Removed user should not be owner of the group" });
    }
    // Remove member
    await pool.query(
      "DELETE FROM group_members WHERE group_id = $1 AND user_id = $2",
      [groupId, removeUserId]
    );
    res.status(200).json({ message: "User removed from group" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get group info and members
exports.getGroup = async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user.id;
  try {
    // Check membership
    const member = await pool.query(
      "SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2",
      [groupId, userId]
    );
    if (!member.rows.length) {
      return res.status(403).json({ error: "Not a group member" });
    }
    // Get group info
    const group = await pool.query("SELECT * FROM groups WHERE id = $1", [
      groupId,
    ]);
    const members = await pool.query(
      `SELECT u.id, u.name, u.email FROM users u
       JOIN group_members gm ON u.id = gm.user_id
       WHERE gm.group_id = $1`,
      [groupId]
    );
    res.json({ ...group.rows[0], members: members.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeGroup = async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user.id;
  try {
    // Check ownership
    const group = await pool.query(
      "SELECT owner_id FROM groups WHERE id = $1",
      [groupId]
    );
    if (!group.rows.length || group.rows[0].owner_id !== userId) {
      return res.status(403).json({ error: "Permission denied" });
    }
    // Remove group
    await pool.query("DELETE FROM groups WHERE id = $1", [groupId]);
    res.status(200).json({ message: "Group removed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
