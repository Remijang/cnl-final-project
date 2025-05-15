const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscriptionController");

router.post("/:id/subscribe", subscriptionController.subscribeCalendar);
router.post("/:id/unsubscribe", subscriptionController.unsubscribeCalendar);

module.exports = router;
