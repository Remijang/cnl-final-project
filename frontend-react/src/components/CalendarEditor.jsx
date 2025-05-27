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
        placeholder="行事曆名稱"
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
        公開
      </label>
      <button type="submit" className="search-button ml-2">
        儲存
      </button>
    </form>
  );
};

export default CalendarEditor;
