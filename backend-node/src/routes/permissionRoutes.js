const express = require("express");
const router = express.Router();
const permissionController = require("../controllers/permissionController");

router.post("/:calendarId/visibility/on", permissionController.visibilityOn);
router.post("/:calendarId/visibility/off", permissionController.visibilityOff);
router.post("/:calendarId/read/on", permissionController.readLinkOn);
router.post("/:calendarId/read/off", permissionController.readLinkOff);
router.post("/:calendarId/write/on", permissionController.writeLinkOn);
router.post("/:calendarId/write/off", permissionController.writeLinkOff);
router.get("/:calendarId/visibility", permissionController.getVisibility);
router.get("/:calendarId/read", permissionController.getReadLinkPermission);
router.get("/:calendarId/write", permissionController.getWriteLinkPermission);

router.post(
  "/:calendarId/read/claim",
  permissionController.claimReadPermission
);
router.post(
  "/:calendarId/write/claim",
  permissionController.claimWritePermission
);
router.delete(
  "/:calendarId/read/:removeUserId",
  permissionController.removeReadPermission
);

router.delete(
  "/:calendarId/write/:removeUserId",
  permissionController.removeWritePermission
);

module.exports = router;
