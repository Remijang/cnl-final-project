const express = require("express");
const router = express.Router();
const availabilityController = require("../controllers/availabilityController");

router.post("/", availabilityController.setAvailability);
router.get("/groups/:groupId", availabilityController.checkgroupAvailability);

module.exports = router;
