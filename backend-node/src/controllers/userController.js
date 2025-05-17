const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id; // User ID is now available in req.user from the middleware
    const result = await pool.query(
      "SELECT id, name, email, avatar_url, bio, created_at, updated_at FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 1) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ message: "User profile not found" });
    }
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  const { name, bio, avatar_url } = req.body;
  const userId = req.user.id; // User ID is available in req.user

  try {
    const result = await pool.query(
      "UPDATE users SET name = $1, bio = $2, avatar_url = $3, updated_at = NOW() WHERE id = $4 RETURNING id, name, email, avatar_url, bio, created_at, updated_at",
      [name, bio, avatar_url, userId]
    );

    if (result.rows.length === 1) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ message: "User profile not found" });
    }
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ error: err.message });
  }
};
