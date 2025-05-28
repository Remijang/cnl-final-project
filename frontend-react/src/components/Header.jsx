import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/Header.css";

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
    <div className="header">
      <h2 style={{ display: "inline", marginRight: "1em" }}>🗓️ Calendar App</h2>
      <Link to="/calendar/" className="link-button">
        Dashboard
      </Link>

      <Link to="/polls" className="link-button">
        Polls
      </Link>

      <Link to="/groups" className="link-button">
        Groups
      </Link>

      <Link to="/profile" className="link-button">
        Profile
      </Link>

      <form
        onSubmit={handleSearch}
        style={{ display: "inline", margin: "0em" }}
      >
        <input
          type="text"
          placeholder="Search User"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-button">
          Search
        </button>
      </form>

      {token ? (
        <button onClick={onLogout} className="link-button">
          Logout
        </button>
      ) : (
        <>
          <Link to="/login" className="link-button">
            Login
          </Link>

          <Link to="/register" className="link-button">
            Register
          </Link>
        </>
      )}
    </div>
  );
};

export default Header;
