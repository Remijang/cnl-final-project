const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");

router.get("/:calendarId", eventController.getEventsByCalendar);
router.post("/", eventController.createEvent);
router.delete("/:id", eventController.deleteEvent);

module.exports = router;
