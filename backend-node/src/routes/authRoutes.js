const express = require("express");
const router = express.Router();
const authService = require("../services/authService");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", authService.register);
router.post("/login", authService.login);
router.post("/logout", authMiddleware, authService.logout);

module.exports = router;
