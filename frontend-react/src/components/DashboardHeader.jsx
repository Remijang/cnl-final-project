import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/Header.css";

const Header = ({ token, onLogout }) => {
  const [searchInput, setSearchInput] = useState("");
  const navigate = useNavigate();

  return (
    <div className="header">
      <Link to="/calendar/" className="link-button">
        Dashboard
      </Link>

      <Link to="/calendar/admin" className="link-button">
        Calendar Admin
      </Link>

      <Link to="/calendar/edit" className="link-button">
        Calendar Editor
      </Link>

      <Link to="/calendar/list" className="link-button">
        Calendar Lists
      </Link>
    </div>
  );
};

export default Header;
