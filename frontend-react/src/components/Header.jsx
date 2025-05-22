import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = ({ token, onLogout }) => {
  const [searchInput, setSearchInput] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/calendar-search/${encodeURIComponent(searchInput.trim())}`);
      setSearchInput("");
    }
  };

  return (
    <div
      style={{
        position: "sticky", // 讓他在畫面上方固定
        top: 0,
        zIndex: 1000,
        backgroundColor: "#f0f0f0",
        padding: "1em",
        borderBottom: "1px solid #ccc",
      }}
    >
      <h2 style={{ display: "inline", marginRight: "1em" }}>🗓️ Calendar App</h2>
      <Link to="/" style={{ marginRight: "1em" }}>
        Dashboard
      </Link>
      <form onSubmit={handleSearch} style={{ display: "inline" }}>
        <input
          type="text"
          placeholder="搜尋使用者"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          style={{ marginLeft: "1em" }}
        />
        <button type="submit">搜尋</button>
      </form>

      <Link to="/polls" style={{ marginRight: "1em" }}>
        Polls
      </Link>
      <Link to="/groups" style={{ marginRight: "1em" }}>
        Groups
      </Link>
      {token ? (
        <button onClick={onLogout} style={{ float: "right" }}>
          Logout
        </button>
      ) : (
        <>
          <Link to="/login" style={{ float: "right", marginLeft: "1em" }}>
            Login
          </Link>
          <Link to="/register" style={{ float: "right" }}>
            Register
          </Link>
        </>
      )}
    </div>
  );
};

export default Header;
