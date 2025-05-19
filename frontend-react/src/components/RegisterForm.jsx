import React, { useState } from "react";
import { register } from "../services/authService";
import { useNavigate } from "react-router-dom";

const RegisterForm = () => {
  const [name, setName] = useState(""); // ✅ 加這行
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register({ name, email, password }); // ✅ 一起傳 name
      alert("註冊成功，請登入");
      navigate("/login");
    } catch (err) {
      console.error("註冊失敗", err);
      alert("註冊失敗：" + err.message); // ✅ 顯示錯誤
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="使用者名稱"
          required
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Register</button>
      </form>

      <p style={{ marginTop: "1em" }}>
        已經有帳號？<button onClick={() => navigate("/login")}>返回登入</button>
      </p>
    </>
  );
};

export default RegisterForm;
