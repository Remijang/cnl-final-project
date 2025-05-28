// pages/ClaimPermissionPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { claimPermissionWithKey } from "../services/permissionService"; // Adjust path based on your project structure
import { useNavigate } from "react-router-dom";

const ClaimPermissionPage = () => {
  const { calendarId, mode, key } = useParams();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [claimedCalendarTitle, setClaimedCalendarTitle] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const handleClaim = async () => {
      // Basic validation of URL parameters
      if (!calendarId || !mode || !key) {
        setError("Invalid permission link. Missing required information.");
        setLoading(false);
        return;
      }
      if (mode !== "read" && mode !== "write") {
        setError("Invalid permission type in link. Must be 'read' or 'write'.");
        setLoading(false);
        return;
      }

      if (!token) {
        setError("You must be logged in to claim this permission.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null); // Clear any previous errors
        await console.log(calendarId, mode, key);
        // Call the service to claim permission
        const response = await claimPermissionWithKey(
          token,
          calendarId,
          mode,
          key
        );

        setSuccess(true);
        // Assuming your backend response includes the calendar title
        setClaimedCalendarTitle(response.title);
        console.log("Permission claimed successfully:", response);
      } catch (err) {
        setError(
          err.message || "Failed to claim permission. Please try again."
        );
        setSuccess(false);
        console.error("Error claiming permission:", err);
      } finally {
        setLoading(false);
      }
    };

    handleClaim();
  }, [token, calendarId, mode, key]); // Dependencies for useEffect

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Claim Calendar Permission
        </h1>

        {loading && (
          <div className="flex flex-col items-center justify-center space-y-4 text-blue-600">
            <svg
              className="animate-spin h-8 w-8 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="text-lg">Claiming permission...</p>
          </div>
        )}

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline ml-2">{error}</span>
            <div className="mt-4">
              <Link
                to="/calendar"
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        )}

        {success && (
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <strong className="font-bold">Success!</strong>
            <span className="block sm:inline ml-2">
              You have successfully claimed **{mode}** permission for **
              {claimedCalendarTitle}**.
            </span>
            <div className="mt-4 flex flex-col space-y-2">
              {/* Assuming you have a dashboard or calendar view */}
              <Link
                to="/calendar"
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
              >
                Go to Dashboard
              </Link>
              {/* Optional: Link directly to the calendar if you have a specific view for it */}
              {/* <Link to={`/calendar/${calendarId}`} className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200">
                View Calendar
              </Link> */}
            </div>
          </div>
        )}

        {/* Display message if none of the above states are active (e.g., initially or after specific errors) */}
        {!loading && !success && !error && (
          <p className="text-gray-600">
            Waiting for a valid claim link to be processed.
          </p>
        )}
      </div>
    </div>
  );
};

export default ClaimPermissionPage;
