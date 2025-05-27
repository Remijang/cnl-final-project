import React from "react";

function CalendarList({ calendars, onSelect }) {
  return (
    <div>
      <ul>
        {calendars.map((cal) => (
          <li
            key={cal.id}
            onClick={() => onSelect(cal.id)}
            className="flex items-center space-x-2 py-2 cursor-pointer hover:bg-gray-100 rounded-md transition"
          >
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span>
              {cal.title} ({cal.visibility ? "Public" : "Private"})
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CalendarList;
