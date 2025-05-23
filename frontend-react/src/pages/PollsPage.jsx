import React, { useEffect, useState } from "react";
import {
  listPoll,
  checkPoll,
  createPoll,
  votePoll,
  confirmPoll,
  cancelPoll,
  inviteUserPoll,
  inviteGroupPoll,
} from "../services/pollService";
import PollManager from "../components/PollManager";
import LoginForm from "../components/LoginForm";

const PollsPage = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [polls, setPolls] = useState([]);
  const [pollDetails, setPollDetails] = useState({}); // hold pollId → time_ranges

  const loadPolls = async () => {
    try {
      const data = await listPoll(token);
      setPolls(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) loadPolls();
  }, [token]);

  const handleCheckPoll = async (pollId) => {
    try {
      const details = await checkPoll(token, pollId);
      setPollDetails((prev) => ({
        ...prev,
        [pollId]: details.time_ranges,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePoll = async (pollData) => {
    await createPoll(token, pollData);
    await loadPolls();
  };

  // --- Updated function ---
  const handleVotePoll = async (pollId, selectedTimeRangeIds) => {
    try {
      // get all time ranges for this poll from pollDetails
      const allTimeRanges = pollDetails[pollId] || [];

      // map all time ranges to votes with is_available true/false
      const votes = allTimeRanges.map((tr) => ({
        time_range_id: tr.id,
        is_available: selectedTimeRangeIds.includes(tr.id),
      }));

      // send votes wrapped inside { votes: [...] }
      await votePoll(token, pollId, { votes });

      await loadPolls();
    } catch (err) {
      console.error("Error voting poll:", err);
    }
  };

  const handleConfirmPoll = async (pollId, confirmedTimeRangeId) => {
    if (!confirmedTimeRangeId) {
      alert("Please select a time range to confirm.");
      return;
    }
    const data = { confirmed_time_range_id: Number(confirmedTimeRangeId) };
    await confirmPoll(token, pollId, data);
    await loadPolls();
  };

  const handleCancelPoll = async (pollId) => {
    await cancelPoll(token, pollId);
    await loadPolls();
  };

  const handleInviteUserPoll = async (pollId, userId) => {
    await inviteUserPoll(token, pollId, { userId });
  };

  const handleInviteGroupPoll = async (pollId, groupId) => {
    await inviteGroupPoll(token, pollId, { groupId });
  };

  return (
    <div>
      <h1>Polls</h1>
      {!token ? (
        <LoginForm setToken={setToken} />
      ) : (
        <PollManager
          polls={polls}
          pollDetails={pollDetails}
          onCheckPoll={handleCheckPoll}
          onCreatePoll={handleCreatePoll}
          onVotePoll={handleVotePoll}
          onConfirmPoll={handleConfirmPoll}
          onCancelPoll={handleCancelPoll}
          onInviteUserPoll={handleInviteUserPoll}
          onInviteGroupPoll={handleInviteGroupPoll}
        />
      )}
    </div>
  );
};

export default PollsPage;
