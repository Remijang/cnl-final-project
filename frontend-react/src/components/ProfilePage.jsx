import React, { useState, useEffect } from "react";
import { getProfile, updateProfile } from "../services/authService";

const ProfilePage = ({ token }) => {
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
};

export default ProfilePage;