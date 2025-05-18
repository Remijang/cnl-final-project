const express = require("express");
const router = express.Router();
const permissionController = require("../controllers/permissionController");

router.post("/:calendarId/visibility/on", permissionController.visibilityOn);
router.post("/:calendarId/visibility/off", permissionController.visibilityOff);
router.post("/:calendarId/read/on", permissionController.readLinkOn);
router.post("/:calendarId/read/off", permissionController.readLinkOff);
router.post("/:calendarId/write/on", permissionController.writeLinkOn);
router.post("/:calendarId/write/off", permissionController.writeLinkOff);
router.get("/:calendarId/read/claim", permissionController.claimReadPermission);
router.get(
  "/:calendarId/write/claim",
  permissionController.claimReadPermission
);
router.delete(
  "/:calendarId/remove/:removeUserId",
  permissionController.removePermission
);

module.exports = router;
