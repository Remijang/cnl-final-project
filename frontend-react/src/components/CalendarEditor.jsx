import React, { useState } from "react";
import "../css/Header.css";

const CalendarEditor = ({ onSave, initialValue }) => {
  const [title, setTitle] = useState(initialValue?.title || "");
  const [shared, setShared] = useState(initialValue?.shared || false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ title, shared });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Name of the Calendar"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="search-input"
      />
      <label>
        <input
          type="checkbox"
          checked={shared}
          onChange={(e) => setShared(e.target.checked)}
        />
        Public
      </label>
      <button
        type="submit"
        className="block bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 ml-2"
      >
        Save
      </button>
    </form>
  );
};

export default CalendarEditor;
