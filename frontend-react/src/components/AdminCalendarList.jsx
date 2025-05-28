import React from "react";
import CalendarAdmin from "./PermisionAdmin";

function AdminCalendarList({ calendars, token, setReload }) {
  // Added selectedCalendarId prop
  return (
    <div className="space-y-2">
      {calendars.length === 0 ? (
        <p className="text-gray-500">No calendars available.</p>
      ) : (
        calendars.map((cal) => (
          <div
            key={cal.id}
            className={
              "p-3 rounded-md cursor-pointer transition duration-150 ease-in-out bg-gray-100 border border-gray-200 hover:bg-gray-200"
            }
          >
            <h4 className="font-semibold text-gray-800">{cal.title}</h4>
            <CalendarAdmin
              token={token}
              calendar={cal}
              setReload={setReload}
            ></CalendarAdmin>
          </div>
        ))
      )}
    </div>
  );
}

export default AdminCalendarList;
