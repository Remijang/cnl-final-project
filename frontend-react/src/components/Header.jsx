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
    <div className="flex flex-wrap justify-center items-center space-x-6 py-4 bg-white">
      <h2 className="text-4xl font-bold inline mr-4">🗓️ Calendar App</h2>
      <Link
        to="/calendar/"
        className="px-4 py-2 rounded-xl text-xl bg-black text-white font-bold hover:bg-blue-600"
      >
        Dashboard
      </Link>

      <Link
        to="/polls"
        className="px-4 py-2 rounded-xl text-xl bg-black text-white font-bold hover:bg-purple-600"
      >
        Polls
      </Link>

      <Link
        to="/groups"
        className="px-4 py-2 rounded-xl text-xl bg-black text-white font-bold hover:bg-purple-600"
      >
        Groups
      </Link>

      <Link
        to="/profile"
        className="px-4 py-2 rounded-xl text-xl bg-black text-white font-bold hover:bg-green-600"
      >
        Profile
      </Link>

      <form onSubmit={handleSearch} className="flex space-x-2">
        <input
          type="text"
          placeholder="Search User"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="px-3 py-1 border-1.5 rounded-xl text-xl"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-xl text-xl bg-black text-white font-bold hover:bg-green-600"
        >
          Search
        </button>
      </form>

      {token ? (
        <button
          onClick={onLogout}
          className="px-4 py-2 rounded-xl text-xl bg-black text-white font-bold hover:bg-red-600"
        >
          Logout
        </button>
      ) : (
        <>
          <Link
            to="/login"
            className="px-4 py-2 rounded-xl text-xl bg-black text-white font-bold hover:bg-red-600"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="px-4 py-2 rounded-xl text-xl bg-blue-500 text-white font-bold hover:bg-red-600"
          >
            Register
          </Link>
        </>
      )}
    </div>
  );
};

export default Header;
