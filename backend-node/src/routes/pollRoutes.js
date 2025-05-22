const express = require("express");
const router = express.Router();
const pollController = require("../controllers/pollController");

router.post("/", pollController.createPoll);
router.put("/:pollId/inviteUser", pollController.inviteUserPoll);
router.put("/:pollId/inviteGroup", pollController.inviteGroupPoll);
router.get("/listPoll", pollController.listPoll);
router.get("/:pollId", pollController.checkPoll);
router.post("/:pollId", pollController.votePoll);
router.put("/:pollId", pollController.updatePoll);
router.get("/:pollId/:userId", pollController.getUserPoll);
router.post("/:pollId/confirm", pollController.confirmPoll);
router.delete("/:pollId", pollController.cancelPoll);

module.exports = router;
