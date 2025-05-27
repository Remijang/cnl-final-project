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
          className="form-checkbox h-5 w-5 text-green-600 rounded focus:ring-0"
        />
        <span className="ml-2 font-medium">Public</span>
      </label>
      <button
        type="submit"
        className="block bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 mt-4"
      >
        Save
      </button>
    </form>
  );
};

export default CalendarEditor;
