import React from "react";
import PollManager from "../components/PollManager";

const PollsPage = ({ token }) => {
  return (
    <div>
      <h2>投票活動</h2>
      <PollManager token={token} />
    </div>
  );
};

export default PollsPage;
