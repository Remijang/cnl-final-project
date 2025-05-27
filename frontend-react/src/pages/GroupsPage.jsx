import React, { useState, useEffect, useCallback } from "react";
import GroupManager from "../components/GroupManager"; // Assuming this path is correct
import { checkGroupAvailability } from "../services/availabilityService"; // Assuming this path is correct
import { useNavigate } from "react-router-dom"; // Import useNavigate

const GroupsPage = ({ token }) => {
  const [availabilityData, setAvailabilityData] = useState(null);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState(null);
  const [currentGroupForAvailability, setCurrentGroupForAvailability] =
    useState(null);
  const [message, setMessage] = useState({ type: "", text: "" }); // State for custom messages

  const [showDateInputModal, setShowDateInputModal] = useState(false);
  const [dateInput, setDateInput] = useState("");
  const [selectedGroupForDate, setSelectedGroupForDate] = useState(null); // { id, name }
  const navigate = useNavigate(); // Initialize useNavigate

  const handleCheckGroupAvailability = (groupId, groupName) => {
    setSelectedGroupForDate({ id: groupId, name: groupName });
    setDateInput(""); // Clear previous date input
    setShowDateInputModal(true); // Show the custom date input modal
  };

  useEffect(() => {
    // Redirect to login page if no token is found
    if (!token) {
      setMessage({
        type: "error",
        text: "Login required to query. Please log in first.",
      });
      setTimeout(() => navigate("/login"), 1500);
      return; // Stop further execution of this effect
    }
    // The original code had handleCheckGroupAvailability in dependencies,
    // but it's not needed here as it's a stable function passed as a prop.
    // Keeping it for minimal change as per instruction.
  }, [token, navigate]);

  const handleDateInputConfirm = async () => {
    if (!dateInput || !/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
      setMessage({
        type: "error",
        text: "Incorrect date format. Please use YYYY-MM-DD format.",
      });
      return;
    }

    setShowDateInputModal(false); // Close the modal
    setIsLoadingAvailability(true);
    setAvailabilityError(null);
    setAvailabilityData(null); // Clear previous data
    setCurrentGroupForAvailability({ ...selectedGroupForDate, day: dateInput });

    try {
      const data = await checkGroupAvailability(
        token,
        selectedGroupForDate.id,
        dateInput
      );
      setAvailabilityData(data);
      setMessage({
        type: "success",
        text: "Free time slots queried successfully!",
      });
    } catch (err) {
      console.error("Failed to query group free time slots:", err);
      setAvailabilityError(
        err.message || "Unable to get free time slot information"
      );
      setMessage({
        type: "error",
        text: `Query failed: ${err.message || "Unknown error"}`,
      });
      setAvailabilityData(null);
    } finally {
      setIsLoadingAvailability(false);
    }
  };

  const handleDateInputCancel = () => {
    setShowDateInputModal(false);
    setDateInput("");
    setSelectedGroupForDate(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-10">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center tracking-tight">
          Group Management
        </h1>

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

        {/* GroupManager will list groups and allow member management */}
        {!token ? (
          // If no token, display the LoginForm centered
          <div className="flex justify-center items-center py-10"></div>
        ) : (
          <GroupManager
            token={token}
            onCheckAvailability={handleCheckGroupAvailability}
          />
        )}

        {/* Custom Date Input Modal */}
        {token && showDateInputModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Enter Date
              </h3>
              <p className="text-gray-600 mb-4">
                Please enter the date (YYYY-MM-DD) to query free time slots for
                group "{selectedGroupForDate?.name}":
              </p>
              <input
                type="date" // Use type="date" for better mobile experience
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleDateInputCancel}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDateInputConfirm}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {token && currentGroupForAvailability && (
          <div className="mt-6 bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Free time slots for group "{currentGroupForAvailability.name}"
              (ID: {currentGroupForAvailability.id}) on{" "}
              {currentGroupForAvailability.day}
            </h3>
            {isLoadingAvailability && (
              <p className="text-blue-600 font-medium">
                Loading free time slots...
              </p>
            )}
            {availabilityError && (
              <p className="text-red-600 font-medium">
                Error: {availabilityError}
              </p>
            )}
            {availabilityData && (
              <div>
                <h4 className="text-lg font-semibold text-gray-700 mt-4 mb-2">
                  Query Results:
                </h4>
                {Array.isArray(availabilityData) &&
                availabilityData.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1 text-gray-800">
                    {availabilityData.map((slot, index) => (
                      <li key={index}>
                        Member ID: {slot.user_id} | Date: {slot.available_date}{" "}
                        | Time: {slot.start_time} - {slot.end_time}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600">
                    Group members have no free time slots set for this date, or
                    all members are unavailable.
                  </p>
                )}
              </div>
            )}
            {/* Message when a query was made but no data/error and not loading */}
            {!isLoadingAvailability &&
              !availabilityError &&
              currentGroupForAvailability &&
              !availabilityData && (
                <p className="text-gray-600 mt-4">
                  Unable to load free time slot information, or no one in this
                  group is available on this date.
                </p>
              )}
          </div>
        )}
        {/* Message to prompt user if no group has been checked yet and not loading/error */}
        {token &&
          !currentGroupForAvailability &&
          !isLoadingAvailability &&
          !availabilityError && (
            <div className="mt-6 bg-white p-6 rounded-lg shadow-md border border-gray-200 text-center text-gray-600">
              <p>
                Please click the "Check Free Time Slots" button next to a group
                in the list above to load information.
              </p>
            </div>
          )}
      </div>
    </div>
  );
};

export default GroupsPage;
