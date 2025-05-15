const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.post("/profile", userController.getProfile);
router.put("/profile", userController.updateProfile);

module.exports = router;
