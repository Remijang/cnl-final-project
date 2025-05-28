import React from "react";
import { Link } from "react-router-dom";
import "../css/Header.css";

const Header = () => {
  return (
    <div className="flex justify-center space-x-4 bg-blue-50 p-4 rounded-lg">
      {[
        { to: "/calendar/", label: "Dashboard" },
        { to: "/calendar/admin", label: "Calendar Admin" },
        { to: "/calendar/edit", label: "Calendar Editor" },
        { to: "/calendar/list", label: "Calendar List" },
      ].map(({ to, label }) => (
        <Link
          key={label}
          to={to}
          className="font-bold text-lg px-4 py-2 bg-white text-black rounded-full border-1.5 border-black shadow hover:bg-gradient-to-r hover:from-blue-300 hover:to-purple-400
 transition"
        >
          {label}
        </Link>
      ))}
    </div>
  );
};

export default Header;
