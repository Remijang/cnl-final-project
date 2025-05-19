const express = require("express");
const router = express.Router();
const pollController = require("../controllers/pollController");

router.post("/", pollController.createPoll);
router.put("/:pollId/inviteUserPoll", pollController.inviteUserPoll);
router.put("/:pollId/inviteGroupPoll", pollController.inviteGroupPoll);
router.get("/listPoll", pollController.listPoll);
router.get("/:pollId", pollController.checkPoll);
router.post("/:pollId/votePoll", pollController.votePoll);
router.put("/:pollId/updatePoll", pollController.updatePoll);
router.get("/:pollId/:userId", pollController.getUserPoll);
router.post("/:pollId/confirmPoll", pollController.confirmPoll);
router.delete("/:pollId", pollController.cancelPoll);

module.exports = router;
