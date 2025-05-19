import React from "react";

const GroupManager = ({ groups, onCreate, onAddUser, onRemoveUser }) => {
  return (
    <div>
      <h2>我的群組</h2>
      <button onClick={onCreate}>建立新群組</button>
      {groups.map((group) => (
        <div key={group.id}>
          <h3>{group.name}</h3>
          <ul>
            {group.members.map((user) => (
              <li key={user.id}>
                {user.email}
                <button onClick={() => onRemoveUser(group.id, user.id)}>移除</button>
              </li>
            ))}
          </ul>
          <button onClick={() => onAddUser(group.id)}>新增成員</button>
        </div>
      ))}
    </div>
  );
};

export default GroupManager;