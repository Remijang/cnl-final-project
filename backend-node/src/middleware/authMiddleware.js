const jwt = require("jsonwebtoken");
const pool = require("../config/db");

module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token" });

  try {
    const token = authHeader.split(" ")[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    const userId = req.user.id;
    const userExist = pool.query(
      `SELECT EXISTS (
        SELECT 1 FROM user_tokens WHERE user_id = $1 AND token = $2
      )`,
      [userId, token]
    );
    if (!userExist) {
      res.status(403).json({ error: "Invalid token" });
    }
    next();
  } catch {
    if (err.name === "TokenExpiredError") {
      console.error("Token has expired");
      res.status(403).json({ error: "Token expired" });
    } else {
      res.status(403).json({ error: "Invalid token" });
    }
  }
};
