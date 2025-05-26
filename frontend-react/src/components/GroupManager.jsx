import React, { useState, useEffect, useCallback } from "react";
import {
  createGroup,
  getAllGroup,
  getGroup,
  addGroupUser,
  removeGroupUser,
} from "../services/groupService";

const GroupManager = ({ token, onCheckAvailability }) => {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" }); // State for custom messages

  // State for Create Group Modal
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  // State for Add User Modal
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [userIdToAdd, setUserIdToAdd] = useState("");
  const [currentGroupIdForAdd, setCurrentGroupIdForAdd] = useState(null);

  // State for Remove User Confirmation Modal
  const [showConfirmRemoveModal, setShowConfirmRemoveModal] = useState(false);
  const [removeConfirmData, setRemoveConfirmData] = useState(null); // { groupId, userIdToRemove, userName }

  const fetchGroupsAndMembers = useCallback(async () => {
    if (!token) {
      setGroups([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    setMessage({ type: "", text: "" }); // Clear messages on new fetch
    try {
      const basicGroups = await getAllGroup(token);
      const detailedGroups = await Promise.all(
        basicGroups.map(async (group) => {
          try {
            const groupDetails = await getGroup(token, group.id);
            return groupDetails;
          } catch (groupError) {
            console.error(
              `Failed to fetch details for group ${group.name} (ID: ${group.id}):`,
              groupError
            );
            return { ...group, members: [], errorLoadingMembers: true };
          }
        })
      );
      setGroups(detailedGroups);
    } catch (err) {
      console.error("Failed to fetch groups:", err);
      setError(err.message || "Failed to fetch groups");
      setMessage({
        type: "error",
        text: `載入群組失敗：${err.message || "未知錯誤"}`,
      });
      setGroups([]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // --- Create Group Handlers ---
  const handleCreateGroupClick = () => {
    setNewGroupName("");
    setShowCreateGroupModal(true);
  };

  const handleCreateGroupConfirm = async () => {
    if (!newGroupName.trim()) {
      setMessage({ type: "error", text: "群組名稱不能為空。" });
      return;
    }
    setShowCreateGroupModal(false);
    try {
      setIsLoading(true);
      await createGroup(token, { name: newGroupName.trim() });
      setMessage({
        type: "success",
        text: `群組 "${newGroupName}" 建立成功！`,
      });
      await fetchGroupsAndMembers(); // Refresh the list
    } catch (err) {
      setMessage({
        type: "error",
        text: `建立群組失敗：${err.message || "未知錯誤"}`,
      });
      setError(err.message || "Failed to create group");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGroupCancel = () => {
    setShowCreateGroupModal(false);
    setNewGroupName("");
  };

  // --- Add User Handlers ---
  const handleAddUserClick = (groupId) => {
    setUserIdToAdd("");
    setCurrentGroupIdForAdd(groupId);
    setShowAddUserModal(true);
  };

  const handleAddUserConfirm = async () => {
    if (!userIdToAdd.trim()) {
      setMessage({ type: "error", text: "成員 User ID 不能為空。" });
      return;
    }
    setShowAddUserModal(false);
    try {
      setIsLoading(true);
      await addGroupUser(token, currentGroupIdForAdd, userIdToAdd.trim());
      setMessage({
        type: "success",
        text: `成員 ${userIdToAdd} 已新增至群組。`,
      });
      await fetchGroupsAndMembers(); // Refresh the list
    } catch (err) {
      setMessage({
        type: "error",
        text: `新增成員失敗：${err.message || "未知錯誤"}`,
      });
      setError(err.message || "Failed to add user to group");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUserCancel = () => {
    setShowAddUserModal(false);
    setUserIdToAdd("");
    setCurrentGroupIdForAdd(null);
  };

  // --- Remove User Handlers ---
  const handleRemoveUserClick = (groupId, userIdToRemove, userName) => {
    setRemoveConfirmData({ groupId, userIdToRemove, userName });
    setShowConfirmRemoveModal(true);
  };

  const handleRemoveUserConfirm = async () => {
    if (!removeConfirmData) return; // Should not happen if modal is shown correctly
    setShowConfirmRemoveModal(false);
    try {
      setIsLoading(true);
      await removeGroupUser(
        token,
        removeConfirmData.groupId,
        removeConfirmData.userIdToRemove
      );
      setMessage({
        type: "success",
        text: `成員 ${
          removeConfirmData.userName || removeConfirmData.userIdToRemove
        } 已從群組移除。`,
      });
      await fetchGroupsAndMembers(); // Refresh the list
    } catch (err) {
      setMessage({
        type: "error",
        text: `移除成員失敗：${err.message || "未知錯誤"}`,
      });
      setError(err.message || "Failed to remove user from group");
    } finally {
      setIsLoading(false);
      setRemoveConfirmData(null);
    }
  };

  const handleRemoveUserCancel = () => {
    setShowConfirmRemoveModal(false);
    setRemoveConfirmData(null);
  };

  // If not logged in, redirect to login page
  if (!token) {
    return null; // Return null to prevent rendering anything before redirect
  }

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
        <h2 className="text-2xl font-bold text-gray-800">我的群組</h2>
        <button
          onClick={handleCreateGroupClick}
          disabled={isLoading}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "處理中..." : "建立新群組"}
        </button>
      </div>

      {isLoading && groups.length === 0 && (
        <p className="text-blue-600 font-medium text-center">載入群組中...</p>
      )}
      {error && (
        <p className="text-red-600 font-medium text-center">
          錯誤：{error}{" "}
          <button
            onClick={fetchGroupsAndMembers}
            disabled={isLoading}
            className="text-blue-600 hover:text-blue-800 font-semibold ml-2"
          >
            重試
          </button>
        </p>
      )}

      {!isLoading && !error && groups.length === 0 && (
        <p className="text-gray-600 text-center">
          您尚未加入任何群組，或沒有群組可顯示。
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <div
            key={group.id}
            className="bg-white rounded-lg shadow-md border border-gray-200 p-6 flex flex-col"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {group.name} (ID: {group.id})
            </h3>
            {group.owner_id && (
              <p className="text-sm text-gray-500 mb-4">
                群組擁有者 ID: {group.owner_id}
              </p>
            )}

            <h4 className="text-lg font-semibold text-gray-700 mb-2">成員:</h4>
            {group.errorLoadingMembers && (
              <p className="text-orange-600 text-sm mb-2">
                無法載入此群組的成員列表。
              </p>
            )}
            {(!group.members || group.members.length === 0) &&
              !group.errorLoadingMembers && (
                <p className="text-gray-600 text-sm mb-2">
                  此群組目前沒有成員。
                </p>
              )}
            {group.members && group.members.length > 0 && (
              <ul className="list-disc list-inside space-y-1 text-gray-800 mb-4 flex-grow">
                {group.members.map((user) => (
                  <li
                    key={user.id}
                    className="flex justify-between items-center"
                  >
                    <span>
                      {user.name || "N/A"} ({user.email || "N/A"}) (ID:{" "}
                      {user.id})
                    </span>
                    <button
                      onClick={() =>
                        handleRemoveUserClick(
                          group.id,
                          user.id,
                          user.name || user.id
                        )
                      }
                      disabled={isLoading}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ml-2"
                    >
                      移除
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-gray-100">
              <button
                onClick={() => handleAddUserClick(group.id)}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                新增成員
              </button>
              {/* Add a button for checking availability here, linked to onCheckAvailability prop */}
              {onCheckAvailability && (
                <button
                  onClick={() => onCheckAvailability(group.id, group.name)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200 shadow-md"
                >
                  查詢空閒時段
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Group Modal */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              建立新群組
            </h3>
            <input
              type="text"
              placeholder="群組名稱"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCreateGroupCancel}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-200"
              >
                取消
              </button>
              <button
                onClick={handleCreateGroupConfirm}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition duration-200"
              >
                建立
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              新增成員至群組
            </h3>
            <p className="text-gray-600 mb-4">請輸入要新增的成員 User ID：</p>
            <input
              type="text"
              placeholder="User ID"
              value={userIdToAdd}
              onChange={(e) => setUserIdToAdd(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleAddUserCancel}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-200"
              >
                取消
              </button>
              <button
                onClick={handleAddUserConfirm}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
              >
                新增
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove User Confirmation Modal */}
      {showConfirmRemoveModal && removeConfirmData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              確認移除成員
            </h3>
            <p className="text-gray-600 mb-4">
              確定要從群組移除成員 "{removeConfirmData.userName}" (ID:{" "}
              {removeConfirmData.userIdToRemove})？
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleRemoveUserCancel}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-200"
              >
                取消
              </button>
              <button
                onClick={handleRemoveUserConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200"
              >
                移除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupManager;
