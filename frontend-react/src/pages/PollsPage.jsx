import React, { useState, useEffect, useCallback } from "react";
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
import { useNavigate } from "react-router-dom"; // Import useNavigate

// Placeholder for PollManager for demonstration purposes
// In your actual project, ensure this component is correctly implemented.
const PollManagerPlaceholder = ({
  polls,
  pollDetails,
  onCheckPoll,
  onCreatePoll,
  onVotePoll,
  onConfirmPoll,
  onCancelPoll,
  onInviteUserPoll,
  onInviteGroupPoll,
}) => {
  const [newPollTitle, setNewPollTitle] = useState("");
  const [newPollOptions, setNewPollOptions] = useState("");

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const optionsArray = newPollOptions
      .split(",")
      .map((opt) => opt.trim())
      .filter((opt) => opt);
    onCreatePoll({ title: newPollTitle, options: optionsArray });
    setNewPollTitle("");
    setNewPollOptions("");
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Create New Poll
        </h2>
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="new-poll-title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Poll Title
            </label>
            <input
              id="new-poll-title"
              type="text"
              value={newPollTitle}
              onChange={(e) => setNewPollTitle(e.target.value)}
              placeholder="e.g., Team Lunch Date"
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label
              htmlFor="new-poll-options"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Options (comma-separated)
            </label>
            <input
              id="new-poll-options"
              type="text"
              value={newPollOptions}
              onChange={(e) => setNewPollOptions(e.target.value)}
              placeholder="e.g., Mon 12pm, Tue 1pm, Wed 12:30pm"
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
          >
            Create Poll
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Active Polls</h2>
        {polls.length === 0 ? (
          <p className="text-gray-500">No polls available.</p>
        ) : (
          <ul className="space-y-4">
            {polls.map((poll) => (
              <li
                key={poll.id}
                className="bg-gray-50 p-4 rounded-md shadow-sm border border-gray-200"
              >
                <h3 className="text-lg font-semibold text-gray-800">
                  {poll.title}
                </h3>
                <p className="text-sm text-gray-600">Status: {poll.status}</p>
                <div className="mt-2 space-x-2">
                  <button
                    onClick={() => onCheckPoll(poll.id)}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition duration-200"
                  >
                    Check Details
                  </button>
                  {pollDetails[poll.id] && (
                    <div className="mt-2 text-sm text-gray-700">
                      <p className="font-medium">Available Time Ranges:</p>
                      <ul className="list-disc list-inside">
                        {pollDetails[poll.id].map((tr) => (
                          <li key={tr.id}>
                            {tr.start_time} - {tr.end_time} (Votes:{" "}
                            {tr.votes_count})
                          </li>
                        ))}
                      </ul>
                      <div className="mt-2">
                        <select
                          onChange={(e) => {
                            const selectedId = e.target.value;
                            if (selectedId) onConfirmPoll(poll.id, selectedId);
                          }}
                          className="p-1 border rounded-md text-sm"
                        >
                          <option value="">Confirm Time</option>
                          {pollDetails[poll.id].map((tr) => (
                            <option key={tr.id} value={tr.id}>
                              {tr.start_time} - {tr.end_time}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => onCancelPoll(poll.id)}
                          className="ml-2 px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition duration-200"
                        >
                          Cancel Poll
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const PollsPage = ({ token }) => {
  const [polls, setPolls] = useState([]);
  const [pollDetails, setPollDetails] = useState({}); // hold pollId → time_ranges
  const [message, setMessage] = useState({ type: "", text: "" }); // State for custom messages

  const navigate = useNavigate(); // Initialize useNavigate

  const loadPolls = async () => {
    // No need to check token here, useEffect handles redirection
    try {
      const data = await listPoll(token);
      setPolls(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // Redirect to login page if no token is found
    if (!token) {
      setMessage({ type: "error", text: "需要登入才能查詢。請先登入。" });
      // Delay the navigation slightly to allow the UI to render the login prompt
      setTimeout(() => navigate("/login"), 1500);
      return; // Stop further execution of this effect
    }
    loadPolls();
  }, [token, navigate]); // Added navigate to dependencies

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
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-10">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center tracking-tight">
          Polls
        </h1>

        {message.text && (
          <div
            className={`p-3 mb-4 rounded-md text-sm text-center ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
            role="alert"
          >
            {message.text}
          </div>
        )}

        {/* Conditional rendering based on token */}
        {!token ? (
          // If no token, display the LoginForm centered
          <div className="flex justify-center items-center py-10"></div>
        ) : (
          // Polls content for logged-in users
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
    </div>
  );
};

export default PollsPage;
