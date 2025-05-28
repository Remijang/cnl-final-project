import React from "react";

const handleCheckCalendar = async (calendarId, navigate) => {
  navigate(`/calendar/view/${calendarId}`);
};

function CalendarList({
  calendars,
  onSelect,
  selectedCalendarId,
  navigate,
  mode,
}) {
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
            {mode === "view" && (
              <button
                onClick={() => handleCheckCalendar(cal.id, navigate)}
                className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ml-2"
              >
                View Calendar
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default CalendarList;
