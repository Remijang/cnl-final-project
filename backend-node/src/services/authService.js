const pool = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

exports.register = async (req, res) => {
  const { email, password, name } = req.body;
  try {
    // check if email is used
    const result_email = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (result_email.rows.length > 0) {
      return res.status(500).json({ error: "Email has already been used" });
    }
    // check if username is used
    const result_name = await pool.query(
      "SELECT * FROM users WHERE name = $1",
      [name]
    );
    if (result_name.rows.length > 0) {
      return res
        .status(500)
        .json({ error: "This username has already been used" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUserResult = await pool.query(
      "INSERT INTO users (name, email, hashed_password) VALUES ($1, $2, $3) RETURNING id, email, name",
      [name, email, hashedPassword]
    );
    const newUser = newUserResult.rows[0];
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = result.rows[0];
    if (
      user &&
      user.hashed_password &&
      (await bcrypt.compare(password, user.hashed_password))
    ) {
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
      });

      // Store the token in the user_tokens table
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 1); // Default to 1 day expiration

      await pool.query(
        "INSERT INTO user_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
        [user.id, token, expiresAt]
      );

      res.status(200).json({ token });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.logout = async (req, res) => {
  const userId = req.user.id;
  try {
    await pool.query("DELETE FROM user_tokens WHERE user_id = $1", [userId]);

    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.googleAuth = async (req, res) => {
  const { name, email, googleId, avatarUrl } = req.body;

  try {
    // Check if a user with the Google ID already exists
    const existingGoogleUserResult = await pool.query(
      "SELECT * FROM users WHERE google_id = $1",
      [googleId]
    );

    if (existingGoogleUserResult.rows.length > 0) {
      const user = existingGoogleUserResult.rows[0];
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
      });

      // Store the token
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 1);

      await pool.query(
        "INSERT INTO user_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
        [user.id, token, expiresAt]
      );

      return res.status(200).json({ token });
    }

    // Check if a user with the email already exists (but without Google ID)
    const existingEmailUserResult = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND google_id IS NULL",
      [email]
    );

    if (existingEmailUserResult.rows.length > 0) {
      // Link the Google account to the existing user
      const user = existingEmailUserResult.rows[0];
      await pool.query(
        "UPDATE users SET google_id = $1, avatar_url = $2, name = $3 WHERE id = $4",
        [googleId, avatarUrl, name, user.id]
      );
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
      });

      // Store the token
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 1);

      await pool.query(
        "INSERT INTO user_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
        [user.id, token, expiresAt]
      );

      return res.status(200).json({ token });
    }

    // Create a new user with Google information
    const newUserResult = await pool.query(
      "INSERT INTO users (name, email, google_id, avatar_url) VALUES ($1, $2, $3, $4) RETURNING id, email, name, avatar_url, google_id",
      [name, email, googleId, avatarUrl]
    );
    const newUser = newUserResult.rows[0];
    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    });

    // Store the token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1);

    await pool.query(
      "INSERT INTO user_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [newUser.id, token, expiresAt]
    );

    res.status(201).json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
