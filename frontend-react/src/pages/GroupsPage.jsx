import React from "react";
import GroupManager from "../components/GroupManager";

const GroupsPage = ({ token }) => {
  return (
    <div>
      <h2>我的群組</h2>
      <GroupManager token={token} />
    </div>
  );
};

export default GroupsPage;