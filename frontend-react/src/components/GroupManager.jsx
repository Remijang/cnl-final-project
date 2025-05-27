import React, { useState, useEffect, useCallback } from "react";
import {
  createGroup,
  getAllGroup,
  getGroup,
  addGroupUser,
  removeGroupUser,
  removeGroup,
} from "../services/groupService";

const GroupManager = ({ token, onCheckAvailability }) => {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" }); // State for custom messages

  // State for Create Group Modal
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const [groupToRemove, setGroupToRemove] = useState(null); // {groupId, groupName}
  const [showConfirmRemoveGroupModal, setShowConfirmRemoveGroupModal] =
    useState(false);

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
        text: `Failed to load groups: ${err.message || "Unknown error"}`,
      });
      setGroups([]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchGroupsAndMembers();
  }, []);

  // --- Create Group Handlers ---
  const handleCreateGroupClick = () => {
    setNewGroupName("");
    setShowCreateGroupModal(true);
  };

  const handleRemoveGroupClick = (group) => {
    setGroupToRemove({ groupId: group.id, groupName: group.name });
    setShowConfirmRemoveGroupModal(true);
  };

  const handleCreateGroupConfirm = async () => {
    if (!newGroupName.trim()) {
      setMessage({ type: "error", text: "Group name cannot be empty." });
      return;
    }
    setShowCreateGroupModal(false);
    try {
      setIsLoading(true);
      await createGroup(token, { name: newGroupName.trim() });
      setMessage({
        type: "success",
        text: `Group "${newGroupName}" created successfully!`,
      });
      await fetchGroupsAndMembers(); // Refresh the list
    } catch (err) {
      setMessage({
        type: "error",
        text: `Failed to create group: ${err.message || "Unknown error"}`,
      });
      setError(err.message || "Failed to create group");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveGroupConfirm = async () => {
    setShowConfirmRemoveGroupModal(false);
    try {
      setIsLoading(true);
      await removeGroup(token, groupToRemove.groupId);

      setMessage({
        type: "success",
        text: `Group "${groupToRemove.groupName}" removed successfully!`,
      });
      await fetchGroupsAndMembers(); // Refresh the list
    } catch (err) {
      setMessage({
        type: "error",
        text: `Failed to remove group: ${err.message || "Unknown error"}`,
      });
      setError(err.message || "Failed to remove group");
    } finally {
      setIsLoading(false);
      setGroupToRemove(null);
    }
  };

  const handleCreateGroupCancel = () => {
    setShowCreateGroupModal(false);
    setNewGroupName("");
  };

  const handleRemoveGroupCancel = () => {
    setShowConfirmRemoveGroupModal(false);
    setGroupToRemove(null);
  };

  // --- Add User Handlers ---
  const handleAddUserClick = (groupId) => {
    setUserIdToAdd("");
    setCurrentGroupIdForAdd(groupId);
    setShowAddUserModal(true);
  };

  const handleAddUserConfirm = async () => {
    if (!userIdToAdd.trim()) {
      setMessage({ type: "error", text: "Member User ID cannot be empty." });
      return;
    }
    setShowAddUserModal(false);
    try {
      setIsLoading(true);
      await addGroupUser(token, currentGroupIdForAdd, userIdToAdd.trim());
      setMessage({
        type: "success",
        text: `Member ${userIdToAdd} added to group.`,
      });
      await fetchGroupsAndMembers(); // Refresh the list
    } catch (err) {
      setMessage({
        type: "error",
        text: `Failed to add member: ${err.message || "Unknown error"}`,
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
        text: `Member ${
          removeConfirmData.userName || removeConfirmData.userIdToRemove
        } removed from group.`,
      });
      await fetchGroupsAndMembers(); // Refresh the list
    } catch (err) {
      setMessage({
        type: "error",
        text: `Failed to remove member: ${err.message || "Unknown error"}`,
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
        <h2 className="text-2xl font-bold text-gray-800">My Groups</h2>
        <button
          onClick={handleCreateGroupClick}
          disabled={isLoading}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Processing..." : "Create New Group"}
        </button>
      </div>

      {isLoading && groups.length === 0 && (
        <p className="text-blue-600 font-medium text-center">
          Loading groups...
        </p>
      )}
      {error && (
        <p className="text-red-600 font-medium text-center">
          Error: {error}{" "}
          <button
            onClick={fetchGroupsAndMembers}
            disabled={isLoading}
            className="text-blue-600 hover:text-blue-800 font-semibold ml-2"
          >
            Retry
          </button>
        </p>
      )}

      {!isLoading && !error && groups.length === 0 && (
        <p className="text-gray-600 text-center">
          You haven't joined any groups yet, or there are no groups to display.
        </p>
      )}

      <div className="">
        {groups.map((group) => (
          <div
            key={group.id}
            className="bg-white rounded-lg shadow-md border border-gray-200 p-6 flex flex-col"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {group.owner_username}
            </h3>
            {group.members[group.members.length - 1].name && (
              <p className="text-sm text-gray-500 mb-4">
                Group Owner: {group.members[group.members.length - 1].name}
              </p>
            )}

            <h4 className="text-lg font-semibold text-gray-700 mb-2">
              Members:
            </h4>
            {group.errorLoadingMembers && (
              <p className="text-orange-600 text-sm mb-2">
                Could not load members for this group.
              </p>
            )}
            {(!group.members || group.members.length === 0) &&
              !group.errorLoadingMembers && (
                <p className="text-gray-600 text-sm mb-2">
                  This group currently has no members.
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
                      {user.name || "N/A"} ({user.email || "N/A"})
                    </span>
                    <button
                      onClick={() =>
                        handleRemoveUserClick(
                          group.id,
                          user.name,
                          user.name || user.id
                        )
                      }
                      disabled={isLoading}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ml-2"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex justify-between items-center w-full">
              {" "}
              {/* Parent flex container */}
              <div className="flex space-x-2">
                {" "}
                {/* New div to group the first two buttons */}
                <button
                  onClick={() => handleAddUserClick(group.id)}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Member
                </button>
                {/* Add a button for checking availability here, linked to onCheckAvailability prop */}
                {onCheckAvailability && (
                  <button
                    onClick={() => onCheckAvailability(group.id, group.name)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200 shadow-md"
                  >
                    Check Availability
                  </button>
                )}
              </div>
              <button
                onClick={() => handleRemoveGroupClick(group)}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Remove Group
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Group Modal */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Create New Group
            </h3>
            <input
              type="text"
              placeholder="Group Name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCreateGroupCancel}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroupConfirm}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition duration-200"
              >
                Create
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
              Add Member to Group
            </h3>
            <p className="text-gray-600 mb-4">
              Please enter the User ID of the member to add:
            </p>
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
                Cancel
              </button>
              <button
                onClick={handleAddUserConfirm}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
              >
                Add
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
              Confirm Remove Member
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to remove member "
              {removeConfirmData.userName}" from the group?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleRemoveUserCancel}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveUserConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Remove Group Modal */}
      {showConfirmRemoveGroupModal && groupToRemove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Confirm Remove Group
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to remove group "{groupToRemove.groupName}"?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleRemoveGroupCancel}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveGroupConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupManager;
