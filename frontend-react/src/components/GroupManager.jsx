import React, { useState, useEffect, useCallback } from 'react';
import {
  createGroup,
  getAllGroup,
  getGroup,
  addGroupUser,
  removeGroupUser,
} from '../services/groupService';

// A simple prompt for user input. Consider using a modal for better UX.
const promptForInput = (message, defaultValue = "") => window.prompt(message, defaultValue);

const GroupManager = ({ token }) => {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchGroupsAndMembers = useCallback(async () => {
    if (!token) {
      setGroups([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const basicGroups = await getAllGroup(token);
      const detailedGroups = await Promise.all(
        basicGroups.map(async (group) => {
          try {
            // Fetch detailed info including members for each group
            const groupDetails = await getGroup(token, group.id);
            return groupDetails;
          } catch (groupError) {
            console.error(`Failed to fetch details for group ${group.name} (ID: ${group.id}):`, groupError);
            // Return basic group info with an error message for members
            return { ...group, members: [], errorLoadingMembers: true };
          }
        })
      );
      setGroups(detailedGroups);
    } catch (err) {
      console.error("Failed to fetch groups:", err);
      setError(err.message || 'Failed to fetch groups');
      setGroups([]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchGroupsAndMembers();
  }, [fetchGroupsAndMembers]);

  const handleCreateGroup = async () => {
    const name = promptForInput("請輸入新群組的名稱：");
    if (name && name.trim()) {
      try {
        setIsLoading(true);
        await createGroup(token, { name: name.trim() });
        await fetchGroupsAndMembers(); // Refresh the list
      } catch (err) {
        alert(`建立群組失敗：${err.message || '未知錯誤'}`);
        setError(err.message || 'Failed to create group');
        setIsLoading(false);
      }
    }
  };

  const handleAddUser = async (groupId) => {
    const userIdToAdd = promptForInput("請輸入要新增的成員 User ID：");
    if (userIdToAdd && userIdToAdd.trim()) {
      try {
        setIsLoading(true);
        // groupService.addGroupUser(token, groupId, userId) sends { groupId, addUserId: userId }
        // Backend groupController.addGroupUser expects { addUserId } in body. This should work.
        await addGroupUser(token, groupId, userIdToAdd.trim());
        await fetchGroupsAndMembers(); // Refresh the list
      } catch (err) {
        alert(`新增成員失敗：${err.message || '未知錯誤'}`);
        setError(err.message || 'Failed to add user to group');
        setIsLoading(false);
      }
    }
  };

  const handleRemoveUser = async (groupId, userIdToRemove) => {
    // WARNING: This relies on groupService.removeGroupUser sending the correct payload.
    // As per your provided groupService.js, it sends `addUserId` in the body,
    // but your backend groupController.js expects `removeUserId`.
    // This will fail unless groupService.js is corrected as noted above.
    if (window.confirm(`確定要從群組移除此成員 (ID: ${userIdToRemove})？`)) {
      try {
        setIsLoading(true);
        await removeGroupUser(token, groupId, userIdToRemove);
        await fetchGroupsAndMembers(); // Refresh the list
      } catch (err) {
        alert(`移除成員失敗：${err.message || '未知錯誤'}`);
        setError(err.message || 'Failed to remove user from group');
        setIsLoading(false);
      }
    }
  };

  if (!token) {
    return <p>請先登入以管理群組。</p>;
  }

  return (
    <div>
      <h2>我的群組</h2>
      <button onClick={handleCreateGroup} disabled={isLoading}>
        {isLoading ? '處理中...' : '建立新群組'}
      </button>

      {isLoading && groups.length === 0 && <p>載入群組中...</p>}
      {error && <p style={{ color: 'red' }}>錯誤：{error} <button onClick={fetchGroupsAndMembers} disabled={isLoading}>重試</button></p>}
      
      {!isLoading && !error && groups.length === 0 && <p>您尚未加入任何群組，或沒有群組可顯示。</p>}

      {groups.map((group) => (
        <div key={group.id} style={{ border: '1px solid #eee', margin: '10px 0', padding: '10px' }}>
          <h3>{group.name} (ID: {group.id})</h3>
          {group.owner_id && <p><small>群組擁有者 ID: {group.owner_id}</small></p>}
          
          <h4>成員:</h4>
          {group.errorLoadingMembers && <p style={{color: 'orange'}}>無法載入此群組的成員列表。</p>}
          {(!group.members || group.members.length === 0) && !group.errorLoadingMembers && <p>此群組目前沒有成員。</p>}
          {group.members && group.members.length > 0 && (
            <ul>
              {group.members.map((user) => (
                <li key={user.id}>
                  {user.name || 'N/A'} ({user.email || 'N/A'}) (ID: {user.id})
                  <button 
                    onClick={() => handleRemoveUser(group.id, user.id)} 
                    disabled={isLoading}
                    style={{ marginLeft: '10px' }}
                  >
                    移除
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button onClick={() => handleAddUser(group.id)} disabled={isLoading}>
            新增成員
          </button>
        </div>
      ))}
    </div>
  );
};

export default GroupManager;