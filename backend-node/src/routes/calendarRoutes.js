const express = require("express");
const router = express.Router();
const calendarController = require("../controllers/calendarController");

router.post("/", calendarController.createCalendar);
router.get("/owned", calendarController.getUserCalendar);
router.get("/subscribed", calendarController.getSubscribedCalendar);
router.get("/read", calendarController.getReadCalendar);
router.get("/write", calendarController.getWriteCalendar);
router.put("/:calendarId", calendarController.updateCalendar);
router.delete("/:calendarId", calendarController.deleteCalendar);
router.get("/user", calendarController.getVisibleCalendarByUsername);

module.exports = router;
