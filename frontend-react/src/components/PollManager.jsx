import React from "react";

const PollManager = ({ polls, onCreatePoll, onVote }) => {
  return (
    <div>
      <h2>投票活動</h2>
      <button onClick={onCreatePoll}>建立新投票</button>
      <ul>
        {polls.map((poll) => (
          <li key={poll.id}>
            {poll.title} - {poll.status}
            <button onClick={() => onVote(poll.id)}>投票</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PollManager;
