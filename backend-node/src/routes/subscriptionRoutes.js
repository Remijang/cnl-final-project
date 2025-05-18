const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscriptionController");

router.post("/:calendarId/subscribe", subscriptionController.subscribeCalendar);
router.post(
  "/:calendarId/unsubscribe",
  subscriptionController.unsubscribeCalendar
);

module.exports = router;
