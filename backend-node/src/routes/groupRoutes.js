const express = require("express");
const router = express.Router();
const groupController = require("../controllers/groupController");

router.post("/", groupController.createGroup);
router.get("/", groupController.getAllGroup);
router.post("/:groupId/add", groupController.addGroupUser);
router.post("/:groupId/remove", groupController.removeGroupUser);
router.get("/:groupId", groupController.getGroup);

module.exports = router;
