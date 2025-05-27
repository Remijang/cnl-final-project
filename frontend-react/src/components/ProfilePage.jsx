import React, { useState, useEffect } from "react";
import { getProfile, updateProfile } from "../services/authService";
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

  // 取得使用者資料
  useEffect(() => {
    if (!token) return;

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
        setError(err.response?.data?.error || "取得資料失敗");
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setSuccessMsg(null);

    try {
      const updatedProfile = await updateProfile(formData, token);
      setProfile(updatedProfile);
      setSuccessMsg("個人資料更新成功！");
    } catch (err) {
      const errorMsg = err.response?.data?.error || "更新失敗";
      setError(
        errorMsg.includes("重複") ? "此名稱已被使用，請更換其他名稱" : errorMsg
      );
    }
  };

  if (loading) return <div className="loading">載入中...</div>;
  if (!profile) return <div className="error">{error || "使用者不存在"}</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-10">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center tracking-tight">
          Profile
        </h1>

        {/* Alert Messages */}
        {error && (
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
        )}

        <div className="flex flex-col items-center space-y-8 md:flex-row md:items-start md:space-y-0 md:space-x-8">
          {/* Avatar Section */}
          <div className="flex-shrink-0 mb-4 md:mb-0 flex flex-col items-center">
            {" "}
            {/* Added flex flex-col items-center here */}
            <img
              src={formData.avatar_url}
              className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-md ring-2 ring-indigo-500 mb-2" /* Added mb-2 for spacing */
            />
            <p className="text-sm text-gray-500 text-center">
              {/* You can display the alt text here, or a custom caption */}
              使用者頭像
            </p>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-6">
            {/* Name Input */}
            <div className="form-group">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                姓名
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
                個人簡介
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
                頭像網址
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
                更新資料
              </button>
            </div>
          </form>
        </div>

        {/* Readonly Info */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-gray-600 text-sm leading-relaxed space-y-2">
          <p>
            <strong>電子郵件:</strong>{" "}
            <span className="font-medium text-gray-800">{profile.email}</span>
          </p>
          <p>
            <strong>註冊時間:</strong>{" "}
            <span className="font-medium text-gray-800">
              {new Date(profile.created_at).toLocaleString()}
            </span>
          </p>
          <p>
            <strong>最後更新:</strong>{" "}
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
