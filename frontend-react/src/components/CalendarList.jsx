import React from "react";
import CalendarAdmin from "./PermisionAdmin";

function CalendarList({ calendars, onSelect, selectedCalendarId, token }) {
  // Added selectedCalendarId prop
  return (
    <div className="space-y-2">
      {calendars.length === 0 ? (
        <p className="text-gray-500">No calendars available.</p>
      ) : (
        calendars.map((cal) => (
          <div
            key={cal.id}
            onClick={() => onSelect(cal.id)}
            className={`p-3 rounded-md cursor-pointer transition duration-150 ease-in-out ${
              selectedCalendarId === cal.id
                ? "bg-blue-100 border-blue-400 border-2"
                : "bg-gray-100 border border-gray-200 hover:bg-gray-200"
            }`}
          >
            <h4 className="font-semibold text-gray-800">{cal.title}</h4>
            <CalendarAdmin token={token} calendarId={cal.id}></CalendarAdmin>
          </div>
        ))
      )}
    </div>
  );
}

export default CalendarList;
