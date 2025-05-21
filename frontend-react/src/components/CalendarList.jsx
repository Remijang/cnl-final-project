import React from 'react';

function CalendarList({ calendars, onSelect }) {
  return (
    <div>
      <h2>My Calendar</h2>
      <ul>
        {calendars.map((cal) => (
          <li key={cal.id} onClick={() => onSelect(cal.id)}>
            {cal.title} ({cal.visibility ? 'Public' : 'Private'})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CalendarList;