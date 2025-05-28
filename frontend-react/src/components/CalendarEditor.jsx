import React, { useState } from "react";
// import "../css/Header.css"; // This CSS file is no longer needed with Tailwind CSS

const CalendarEditor = ({ onSave, initialValue }) => {
  const [title, setTitle] = useState(initialValue?.title || "");
  const [shared, setShared] = useState(initialValue?.shared || false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ title, shared });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Create or Edit Calendar</h2>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 p-4 bg-white rounded-lg shadow-md"
      >
        <input
          type="text"
          placeholder="Enter name of calendar"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
        />
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={shared}
            onChange={(e) => setShared(e.target.checked)}
            className="form-checkbox h-5 w-5 text-green-600 rounded focus:ring-0"
          />
          <span className="ml-2 text-gray-700 font-medium">Public</span>
        </label>
        <button
          type="submit"
          className="w-full sm:w-auto bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700 transition duration-300 ease-in-out shadow-md"
        >
          Save
        </button>
      </form>
    </div>
  );
};

export default CalendarEditor;
