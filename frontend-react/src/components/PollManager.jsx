import React, { useState } from "react";

const PollManager = ({
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
  const [showCreatePollModal, setShowCreatePollModal] = useState(false); // Renamed from showCreateForm
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeRanges, setTimeRanges] = useState([
    { start_time: "", end_time: "" },
  ]);
  const [selectedTimeRanges, setSelectedTimeRanges] = useState({});
  const [confirmSelections, setConfirmSelections] = useState({});
  const [visiblePolls, setVisiblePolls] = useState({});

  const [inviteInputs, setInviteInputs] = useState({}); // { pollId: { user: "", group: "" } }
  const [showInviteFields, setShowInviteFields] = useState({}); // { pollId: { user: false, group: false } }
  const [message, setMessage] = useState({ type: "", text: "" }); // State for custom messages

  // State for Confirm Cancel Poll Modal
  const [showConfirmCancelModal, setShowConfirmCancelModal] = useState(false);
  const [pollToCancel, setPollToCancel] = useState(null); // Stores pollId for confirmation

  // State for Confirm Time Range Modal (for onConfirmPoll)
  const [showConfirmTimeRangeModal, setShowConfirmTimeRangeModal] =
    useState(false);
  const [confirmTimeRangeData, setConfirmTimeRangeData] = useState(null); // { pollId, timeRangeId }

  const handleAddTimeRange = () => {
    setTimeRanges([...timeRanges, { start_time: "", end_time: "" }]);
  };

  const handleRemoveTimeRange = (index) => {
    if (timeRanges.length === 1) return;
    setTimeRanges(timeRanges.filter((_, i) => i !== index));
  };

  const handleTimeRangeChange = (index, field, value) => {
    const newTimeRanges = [...timeRanges];
    newTimeRanges[index][field] = value;
    setTimeRanges(newTimeRanges);
  };

  const handleCreatePollSubmit = () => {
    // Renamed to avoid conflict with onCreatePoll prop
    setMessage({ type: "", text: "" }); // Clear previous messages
    if (!title.trim()) {
      setMessage({ type: "error", text: "Title is required" });
      return;
    }
    for (const range of timeRanges) {
      if (!range.start_time || !range.end_time) {
        setMessage({ type: "error", text: "Please fill out all time ranges" });
        return;
      }
      if (new Date(range.start_time) >= new Date(range.end_time)) {
        setMessage({
          type: "error",
          text: "Start time must be before end time in each range",
        });
        return;
      }
    }

    const newPoll = { title, description, time_ranges: timeRanges };
    onCreatePoll(newPoll); // Call the prop function

    setMessage({ type: "success", text: "Poll created successfully!" }); // Success message
    // Reset form fields and close modal
    setTitle("");
    setDescription("");
    setTimeRanges([{ start_time: "", end_time: "" }]);
    setShowCreatePollModal(false);
  };

  const handleCheckClick = (pollId) => {
    onCheckPoll(pollId);
    setVisiblePolls((prev) => ({ ...prev, [pollId]: true }));
    setSelectedTimeRanges((prev) => ({ ...prev, [pollId]: [] }));
  };

  const handleToggleTimeRange = (pollId, timeRangeId) => {
    setSelectedTimeRanges((prev) => {
      const current = prev[pollId] || [];
      if (current.includes(timeRangeId)) {
        return {
          ...prev,
          [pollId]: current.filter((id) => id !== timeRangeId),
        };
      } else {
        return {
          ...prev,
          [pollId]: [...current, timeRangeId],
        };
      }
    });
  };

  const handleSelectConfirmTimeRange = (pollId, timeRangeId) => {
    setConfirmSelections((prev) => ({
      ...prev,
      [pollId]: timeRangeId,
    }));
  };

  const handleVote = (pollId) => {
    onVotePoll(pollId, selectedTimeRanges[pollId] || []);
    setMessage({ type: "success", text: "Vote submitted successfully!" }); // Success message
    setVisiblePolls((prev) => {
      const newVisible = { ...prev };
      delete newVisible[pollId];
      return newVisible;
    });
  };

  const handleInviteSubmit = (pollId, type) => {
    setMessage({ type: "", text: "" }); // Clear previous messages
    const inputValue = inviteInputs[pollId]?.[type] || "";
    if (!inputValue.trim()) {
      setMessage({
        type: "error",
        text: `Please enter ${type === "user" ? "user" : "group"} ID.`,
      });
      return;
    }

    const id = inputValue.trim();

    if (type === "user") {
      onInviteUserPoll(pollId, id);
      setMessage({ type: "success", text: `User ${id} invited to poll!` });
    } else {
      onInviteGroupPoll(pollId, id);
      setMessage({ type: "success", text: `Group ${id} invited to poll!` });
    }

    setInviteInputs((prev) => ({
      ...prev,
      [pollId]: { ...prev[pollId], [type]: "" },
    }));
    setShowInviteFields((prev) => ({
      ...prev,
      [pollId]: { ...prev[pollId], [type]: false },
    }));
  };

  // --- Confirm Poll Time Range Handlers ---
  const handleConfirmPollClick = (pollId, timeRangeId) => {
    if (!timeRangeId) {
      setMessage({
        type: "error",
        text: "Please select a time range to confirm.",
      });
      return;
    }
    setConfirmTimeRangeData({ pollId, timeRangeId });
    setShowConfirmTimeRangeModal(true);
  };

  const handleConfirmTimeRangeConfirm = () => {
    if (confirmTimeRangeData) {
      onConfirmPoll(
        confirmTimeRangeData.pollId,
        confirmTimeRangeData.timeRangeId
      );
      setMessage({
        type: "success",
        text: "Poll time confirmed successfully!",
      });
    }
    setShowConfirmTimeRangeModal(false);
    setConfirmTimeRangeData(null);
  };

  const handleConfirmTimeRangeCancel = () => {
    setShowConfirmTimeRangeModal(false);
    setConfirmTimeRangeData(null);
  };

  // --- Cancel Poll Handlers ---
  const handleCancelPollClick = (pollId) => {
    setPollToCancel(pollId);
    setShowConfirmCancelModal(true);
  };

  const handleCancelPollConfirm = () => {
    if (pollToCancel) {
      onCancelPoll(pollToCancel);
      setMessage({ type: "success", text: "Poll cancelled successfully!" });
    }
    setShowConfirmCancelModal(false);
    setPollToCancel(null);
  };

  const handleCancelPollCancel = () => {
    setShowConfirmCancelModal(false);
    setPollToCancel(null);
  };

  return (
    <div className="space-y-6">
      {/* Message Box */}
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

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Poll Management</h2>
        <button
          onClick={() => setShowCreatePollModal(true)} // Use new state for modal
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition duration-200 shadow-md"
        >
          Create New Poll
        </button>
      </div>

      {/* Create Poll Modal */}
      {showCreatePollModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Create New Poll
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
              />
              <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200 resize-y"
              />
              {timeRanges.map((range, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-2"
                >
                  <input
                    type="datetime-local"
                    value={range.start_time}
                    onChange={(e) =>
                      handleTimeRangeChange(index, "start_time", e.target.value)
                    }
                    className="w-full sm:w-auto p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-600">to</span>
                  <input
                    type="datetime-local"
                    value={range.end_time}
                    onChange={(e) =>
                      handleTimeRangeChange(index, "end_time", e.target.value)
                    }
                    className="w-full sm:w-auto p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {timeRanges.length > 1 && (
                    <button
                      onClick={() => handleRemoveTimeRange(index)}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition duration-200 shadow-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={handleAddTimeRange}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200 shadow-md"
              >
                Add Time Range
              </button>
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setShowCreatePollModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePollSubmit}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200"
                >
                  Submit Poll
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Existing Polls
        </h2>
        {polls.length === 0 ? (
          <p className="text-gray-500">
            No polls available. Create one to get started!
          </p>
        ) : (
          <ul className="space-y-4">
            {polls.map((poll) => (
              <li
                key={poll.id}
                className="bg-gray-50 p-4 rounded-md shadow-sm border border-gray-200"
              >
                <strong className="text-lg text-gray-800 block mb-1">
                  {poll.title}
                </strong>
                {poll.description && (
                  <p className="text-sm text-gray-600 mb-2">
                    {poll.description}
                  </p>
                )}
                <p className="text-sm text-gray-700 mb-3">
                  Status:{" "}
                  <span
                    className={`font-semibold ${
                      poll.is_cancelled
                        ? "text-red-600"
                        : poll.is_confirmed
                        ? "text-green-600"
                        : "text-blue-600"
                    }`}
                  >
                    {poll.is_cancelled
                      ? "Cancelled"
                      : poll.is_confirmed
                      ? "Confirmed"
                      : "Ongoing"}
                  </span>
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  <button
                    onClick={() => handleCheckClick(poll.id)}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition duration-200 shadow-sm"
                  >
                    Check Details
                  </button>
                  <button
                    onClick={() =>
                      setShowInviteFields((prev) => ({
                        ...prev,
                        [poll.id]: {
                          ...(prev[poll.id] || {}),
                          user: !prev[poll.id]?.user,
                        }, // Toggle visibility
                      }))
                    }
                    className="px-3 py-1 bg-yellow-500 text-white text-sm rounded-md hover:bg-yellow-600 transition duration-200 shadow-sm"
                  >
                    Invite User
                  </button>
                  <button
                    onClick={() =>
                      setShowInviteFields((prev) => ({
                        ...prev,
                        [poll.id]: {
                          ...(prev[poll.id] || {}),
                          group: !prev[poll.id]?.group,
                        }, // Toggle visibility
                      }))
                    }
                    className="px-3 py-1 bg-yellow-500 text-white text-sm rounded-md hover:bg-yellow-600 transition duration-200 shadow-sm"
                  >
                    Invite Group
                  </button>
                </div>

                {/* Invite User input */}
                {showInviteFields[poll.id]?.user && (
                  <div className="flex items-center space-x-2 mt-2">
                    <input
                      type="text"
                      placeholder="Enter user ID"
                      value={inviteInputs[poll.id]?.user || ""}
                      onChange={(e) =>
                        setInviteInputs((prev) => ({
                          ...prev,
                          [poll.id]: {
                            ...(prev[poll.id] || {}),
                            user: e.target.value,
                          },
                        }))
                      }
                      className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                    <button
                      onClick={() => handleInviteSubmit(poll.id, "user")}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition duration-200 shadow-sm"
                    >
                      Send
                    </button>
                  </div>
                )}
                {/* Invite Group input */}
                {showInviteFields[poll.id]?.group && (
                  <div className="flex items-center space-x-2 mt-2">
                    <input
                      type="text"
                      placeholder="Enter group ID"
                      value={inviteInputs[poll.id]?.group || ""}
                      onChange={(e) =>
                        setInviteInputs((prev) => ({
                          ...prev,
                          [poll.id]: {
                            ...(prev[poll.id] || {}),
                            group: e.target.value,
                          },
                        }))
                      }
                      className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                    <button
                      onClick={() => handleInviteSubmit(poll.id, "group")}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition duration-200 shadow-sm"
                    >
                      Send
                    </button>
                  </div>
                )}
                {/* Voting and Confirming */}
                {visiblePolls[poll.id] && pollDetails[poll.id] && (
                  <div className="mt-4 bg-gray-100 p-4 rounded-md border border-gray-200">
                    <p className="font-semibold text-gray-700 mb-2">
                      Available Time Ranges:
                    </p>
                    <div className="space-y-2">
                      {pollDetails[poll.id].map((tr) => (
                        <label
                          key={tr.id}
                          className="flex items-center text-gray-800 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={
                              selectedTimeRanges[poll.id]?.includes(tr.id) ||
                              false
                            }
                            onChange={() =>
                              handleToggleTimeRange(poll.id, tr.id)
                            }
                            className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500 mr-2"
                          />
                          <span>
                            {new Date(tr.start_time).toLocaleString()} -{" "}
                            {new Date(tr.end_time).toLocaleString()}
                            <strong className="ml-2 text-blue-700">
                              {" "}
                              ({tr.available_count || 0} votes)
                            </strong>
                          </span>
                        </label>
                      ))}
                    </div>

                    <button
                      onClick={() => handleVote(poll.id)}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 shadow-md"
                    >
                      Vote
                    </button>

                    <div className="mt-4 flex items-center space-x-2">
                      <select
                        value={confirmSelections[poll.id] || ""}
                        onChange={(e) =>
                          handleSelectConfirmTimeRange(poll.id, e.target.value)
                        }
                        className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">-- Confirm Time --</option>
                        {pollDetails[poll.id].map((tr) => (
                          <option key={tr.id} value={tr.id}>
                            {new Date(tr.start_time).toLocaleString()} -{" "}
                            {new Date(tr.end_time).toLocaleString()}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={
                          () =>
                            handleConfirmPollClick(
                              poll.id,
                              confirmSelections[poll.id]
                            ) // Use new handler
                        }
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200 shadow-md"
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => handleCancelPollClick(poll.id)} // Use new handler
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200 shadow-md"
                >
                  Cancel Poll
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Confirm Cancel Poll Modal */}
      {showConfirmCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Confirm Cancellation
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel this poll?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelPollCancel}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-200"
              >
                No, Keep Poll
              </button>
              <button
                onClick={handleCancelPollConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Time Range Modal */}
      {showConfirmTimeRangeModal && confirmTimeRangeData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Confirm Poll Time
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to confirm the time range: <br />
              <span className="font-bold">
                {new Date(
                  pollDetails[confirmTimeRangeData.pollId]?.find(
                    (tr) => tr.id === confirmTimeRangeData.timeRangeId
                  )?.start_time
                ).toLocaleString()}{" "}
                -
                {new Date(
                  pollDetails[confirmTimeRangeData.pollId]?.find(
                    (tr) => tr.id === confirmTimeRangeData.timeRangeId
                  )?.end_time
                ).toLocaleString()}
              </span>
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleConfirmTimeRangeCancel}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmTimeRangeConfirm}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PollManager;
