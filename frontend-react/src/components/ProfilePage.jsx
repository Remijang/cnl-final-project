import React, { useState, useEffect } from "react";
import { getProfile, updateProfile } from "../services/authService";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "../css/Profile.css";

const ProfilePage = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    avatar_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" }); // Add message state for consistency

  const navigate = useNavigate(); // Initialize useNavigate

  const fetchProfile = async () => {
    try {
      const data = await getProfile(token);
      setProfile(data);
      setFormData({
        name: data.name,
        bio: data.bio || "",
        avatar_url: data.avatar_url || "",
      });
      setLoading(false);
    } catch (err) {
      // If profile fetch fails (e.g., token invalid/expired), set error message
      // and redirect to login after clearing the token.
      console.error("Failed to fetch profile:", err);
      setError(err.response?.data?.error || "Failed to retrieve profile data.");
      setMessage({
        type: "error",
        text: `Failed to load profile: ${
          err.response?.data?.error ||
          "Your session might have expired. Please log in again."
        }`,
      });
      setLoading(false);
      localStorage.removeItem("token"); // Clear invalid token
      setToken(""); // Update token state to trigger the redirect logic
      // The `if (!token)` check at the beginning of this `useEffect` will handle the navigation
    }
  };
  // Effect to handle initial token check and profile fetch
  useEffect(() => {
    // If no token, set an error message and redirect to login after a delay
    if (!token) {
      setMessage({
        type: "error",
        text: "Login required to view profile. Please log in first.",
      });
      // Use a timeout to display the message briefly before redirecting
      const timer = setTimeout(() => navigate("/login"), 1500);
      return () => clearTimeout(timer); // Clean up the timer if component unmounts
    }
    fetchProfile();
  }, [token, navigate]); // `token` and `Maps` are dependencies

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setMessage({ type: "", text: "" }); // Clear previous messages

    if (!token) {
      // If no token on submit, also initiate redirect
      setMessage({
        type: "error",
        text: "Please log in to update your profile.",
      });
      setTimeout(() => navigate("/login"), 1500);
      return;
    }

    try {
      const updatedProfile = await updateProfile(token, formData);
      setProfile(updatedProfile);
      setSuccessMsg("Profile updated successfully!");
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Update failed";
      setError(
        errorMsg.includes("duplicate")
          ? "This name is already in use, please choose another name"
          : errorMsg
      );
      setMessage({
        type: "error",
        text: `Profile update failed: ${errorMsg}`,
      });

      // If update fails due to authentication issue (e.g., 401 Unauthorized), redirect
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        setToken(""); // This will trigger the useEffect to redirect
        setMessage({
          type: "error",
          text: "Your session has expired. Please log in again.",
        });
        setTimeout(() => navigate("/login"), 1500);
      }
    } finally {
      await fetchProfile(); // Refresh profile data after update attempt
    }
  };

  // Render loading state until profile data is fetched or redirect is initiated
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-700">Loading profile...</div>
      </div>
    );
  }

  // If we reach here, it means loading is done and either profile is loaded
  // or a redirect has already been scheduled by the useEffect.
  // We can safely assume `profile` is not null if we're rendering the form.
  // If `!profile` somehow happens after loading and no redirect occurred,
  // this implies an unexpected state, which might be handled by a more robust error boundary.

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-10">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center tracking-tight">
          Profile
        </h1>

        {/* Alert Messages (combining error, successMsg, and general message) */}
        {message.text && (
          <div
            className={`p-3 mb-4 rounded-md text-sm text-center ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
            role="alert"
          >
            <span className="block sm:inline">{message.text}</span>
          </div>
        )}

        {/* The `error` and `successMsg` states can be removed if `message` state is fully used */}
        {/* {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-4"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        {successMsg && (
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md relative mb-4"
            role="alert"
          >
            <span className="block sm:inline">{successMsg}</span>
          </div>
        )} */}

        <div className="flex flex-col items-center space-y-8 md:flex-row md:items-start md:space-y-0 md:space-x-8">
          {/* Avatar Section */}
          <div className="flex-shrink-0 mb-4 md:mb-0 flex flex-col items-center">
            <img
              src={formData.avatar_url}
              className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-md ring-2 ring-indigo-500 mb-2"
            />
            <p className="text-sm text-gray-500 text-center">User Avatar</p>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-6">
            {/* Name Input */}
            <div className="form-group">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400 text-base"
              />
            </div>

            {/* Bio Textarea */}
            <div className="form-group">
              <label
                htmlFor="bio"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400 text-base resize-y"
              ></textarea>
            </div>

            {/* Avatar URL Input */}
            <div className="form-group">
              <label
                htmlFor="avatar_url"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Avatar URL
              </label>
              <input
                type="url"
                id="avatar_url"
                name="avatar_url"
                value={formData.avatar_url}
                onChange={handleChange}
                placeholder="https://example.com/avatar.jpg"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400 text-base"
              />
            </div>

            {/* Submit Button */}
            <div className="form-group">
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 ease-in-out transform hover:-translate-y-0.5"
              >
                Update Profile
              </button>
            </div>
          </form>
        </div>

        {/* Readonly Info */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-gray-600 text-sm leading-relaxed space-y-2">
          <p>
            <strong>Email:</strong>{" "}
            <span className="font-medium text-gray-800">{profile.email}</span>
          </p>
          <p>
            <strong>Registered At:</strong>{" "}
            <span className="font-medium text-gray-800">
              {new Date(profile.created_at).toLocaleString()}
            </span>
          </p>
          <p>
            <strong>Last Updated:</strong>{" "}
            <span className="font-medium text-gray-800">
              {new Date(profile.updated_at).toLocaleString()}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
