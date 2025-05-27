const express = require("express");
const router = express.Router();
const groupController = require("../controllers/groupController");

router.post("/", groupController.createGroup);
router.get("/", groupController.getAllGroup);
router.post("/:groupId/user", groupController.addGroupUser);
router.delete("/:groupId/user", groupController.removeGroupUser);
router.get("/:groupId", groupController.getGroup);
router.delete("/:groupId", groupController.deleteGroup);

module.exports = router;
