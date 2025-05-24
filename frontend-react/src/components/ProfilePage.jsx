import React, { useState, useEffect } from "react";
import { getProfile, updateProfile } from "../services/authService";

/*const ProfilePage = ({ token }) => {
  const [email, setEmail] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const profile = await getProfile(token);
      setEmail(profile.email);
    };
    fetchProfile();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateProfile(token, { email });
    alert("資料已更新");
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Email:</label>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <button type="submit">更新</button>
    </form>
  );
};*/

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
    <div className="profile-container">
      <h1>個人資料</h1>

      {error && <div className="alert error">{error}</div>}
      {successMsg && <div className="alert success">{successMsg}</div>}

      <div className="profile-info">
        <div className="avatar-section">
          <img
            src={formData.avatar_url || "/default-avatar.png"}
            alt="使用者頭像"
            className="profile-avatar"
          />
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label>姓名</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>個人簡介</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="4"
            />
          </div>

          <div className="form-group">
            <label>頭像網址</label>
            <input
              type="url"
              name="avatar_url"
              value={formData.avatar_url}
              onChange={handleChange}
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          <div className="form-group">
            <button type="submit" className="submit-btn">
              更新資料
            </button>
          </div>
        </form>

        <div className="readonly-info">
          <p>電子郵件: {profile.email}</p>
          <p>註冊時間: {new Date(profile.created_at).toLocaleString()}</p>
          <p>最後更新: {new Date(profile.updated_at).toLocaleString()}</p>
        </div>
      </div>

      <style jsx>{`
        .profile-container {
          max-width: 800px;
          margin: 2rem auto;
          padding: 2rem;
          background: #f8f9fa;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .profile-info {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 2rem;
        }
        .avatar-section {
          text-align: center;
        }
        .profile-avatar {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid #ddd;
        }
        .profile-form {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
        }
        .form-group {
          margin-bottom: 1.5rem;
        }
        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }
        input,
        textarea {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }
        .submit-btn {
          background: #007bff;
          color: white;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .submit-btn:hover {
          background: #0056b3;
        }
        .readonly-info {
          margin-top: 2rem;
          color: #666;
        }
        .alert {
          padding: 1rem;
          margin-bottom: 1.5rem;
          border-radius: 4px;
        }
        .error {
          background: #f8d7da;
          color: #721c24;
        }
        .success {
          background: #d4edda;
          color: #155724;
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;
