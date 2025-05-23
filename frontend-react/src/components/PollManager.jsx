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
  const [showCreateForm, setShowCreateForm] = useState(false);
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

  const inputStyle = {
    width: "300px",
    padding: "8px",
    marginBottom: "10px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    display: "block",
  };

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

  const handleCreatePoll = () => {
    if (!title.trim()) {
      alert("Title is required");
      return;
    }
    for (const range of timeRanges) {
      if (!range.start_time || !range.end_time) {
        alert("Please fill out all time ranges");
        return;
      }
      if (new Date(range.start_time) >= new Date(range.end_time)) {
        alert("Start time must be before end time in each range");
        return;
      }
    }

    const newPoll = { title, description, time_ranges: timeRanges };
    onCreatePoll(newPoll);

    setTitle("");
    setDescription("");
    setTimeRanges([{ start_time: "", end_time: "" }]);
    setShowCreateForm(false);
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
    setVisiblePolls((prev) => {
      const newVisible = { ...prev };
      delete newVisible[pollId];
      return newVisible;
    });
  };

  const handleInviteSubmit = (pollId, type) => {
    const inputValue = inviteInputs[pollId]?.[type] || "";
    if (!inputValue.trim()) {
      alert(`Please enter ${type === "user" ? "user" : "group"} ID.`);
      return;
    }

    const id = inputValue.trim();

    if (type === "user") {
      onInviteUserPoll(pollId, id);
    } else {
      onInviteGroupPoll(pollId, id);
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

  return (
    <div>
      <h2>Polls</h2>
      <button onClick={() => setShowCreateForm(true)}>Create New Poll</button>

      {showCreateForm && (
        <div style={{ marginTop: "20px" }}>
          <h3>Create New Poll</h3>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={inputStyle}
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            style={{ ...inputStyle, resize: "none" }}
          />
          {timeRanges.map((range, index) => (
            <div key={index} style={{ marginTop: "5px" }}>
              <input
                type="datetime-local"
                value={range.start_time}
                onChange={(e) =>
                  handleTimeRangeChange(index, "start_time", e.target.value)
                }
              />
              to
              <input
                type="datetime-local"
                value={range.end_time}
                onChange={(e) =>
                  handleTimeRangeChange(index, "end_time", e.target.value)
                }
              />
              {timeRanges.length > 1 && (
                <button onClick={() => handleRemoveTimeRange(index)}>
                  Remove
                </button>
              )}
            </div>
          ))}
          <button onClick={handleAddTimeRange} style={{ marginTop: "5px" }}>
            Add Time Range
          </button>
          <br />
          <button onClick={handleCreatePoll} style={{ marginTop: "10px" }}>
            Submit
          </button>
        </div>
      )}

      <ul>
        {polls.map((poll) => (
          <li key={poll.id} style={{ marginBottom: "20px" }}>
            <strong>{poll.title}</strong>
            {poll.description && <p>{poll.description}</p>}
            Status:{" "}
            {poll.is_cancelled
              ? "Cancelled"
              : poll.is_confirmed
              ? "Confirmed"
              : "Ongoing"}
            <div style={{ marginTop: "8px" }}>
              <button onClick={() => handleCheckClick(poll.id)}>Check</button>
              <button
                onClick={() =>
                  setShowInviteFields((prev) => ({
                    ...prev,
                    [poll.id]: { ...(prev[poll.id] || {}), user: true },
                  }))
                }
                style={{ marginLeft: "5px" }}
              >
                Invite User
              </button>
              <button
                onClick={() =>
                  setShowInviteFields((prev) => ({
                    ...prev,
                    [poll.id]: { ...(prev[poll.id] || {}), group: true },
                  }))
                }
                style={{ marginLeft: "5px" }}
              >
                Invite Group
              </button>
            </div>
            {/* Invite User input */}
            {showInviteFields[poll.id]?.user && (
              <div style={{ marginTop: "8px" }}>
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
                  style={inputStyle}
                />
                <button onClick={() => handleInviteSubmit(poll.id, "user")}>
                  Send
                </button>
              </div>
            )}
            {/* Invite Group input */}
            {showInviteFields[poll.id]?.group && (
              <div style={{ marginTop: "8px" }}>
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
                  style={inputStyle}
                />
                <button onClick={() => handleInviteSubmit(poll.id, "group")}>
                  Send
                </button>
              </div>
            )}
            {/* Voting and Confirming */}
            {visiblePolls[poll.id] && pollDetails[poll.id] && (
              <>
                <div style={{ marginTop: "10px" }}>
                  {pollDetails[poll.id].map((tr) => (
                    <label
                      key={tr.id}
                      style={{ display: "block", marginBottom: "5px" }}
                    >
                      <input
                        type="checkbox"
                        checked={
                          selectedTimeRanges[poll.id]?.includes(tr.id) || false
                        }
                        onChange={() => handleToggleTimeRange(poll.id, tr.id)}
                      />
                      {new Date(tr.start_time).toLocaleString()} -{" "}
                      {new Date(tr.end_time).toLocaleString()}
                      <strong> ({tr.available_count || 0} votes)</strong>
                    </label>
                  ))}
                </div>

                <button
                  onClick={() => handleVote(poll.id)}
                  style={{ marginTop: "10px" }}
                >
                  Vote
                </button>

                <div style={{ marginTop: "10px" }}>
                  <select
                    value={confirmSelections[poll.id] || ""}
                    onChange={(e) =>
                      handleSelectConfirmTimeRange(poll.id, e.target.value)
                    }
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
                    onClick={() =>
                      onConfirmPoll(poll.id, confirmSelections[poll.id])
                    }
                    style={{ marginLeft: "10px" }}
                  >
                    Confirm
                  </button>
                </div>
              </>
            )}
            <button
              onClick={() => onCancelPoll(poll.id)}
              style={{ marginTop: "10px" }}
            >
              Cancel
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PollManager;
