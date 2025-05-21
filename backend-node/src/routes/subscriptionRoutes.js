const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscriptionController");

router.post("/:calendarId", subscriptionController.subscribeCalendar);
router.delete("/:calendarId", subscriptionController.unsubscribeCalendar);

module.exports = router;
