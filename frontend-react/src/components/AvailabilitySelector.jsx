import React from "react";

const AvailabilitySelector = ({ day, timeSlots, selected, onChange }) => {
  return (
    <div>
      <h3>{day} Available Time</h3>
      {timeSlots.map((slot) => (
        <label key={slot.id} style={{ marginRight: "10px" }}>
          <input
            type="checkbox"
            checked={selected.includes(slot.id)}
            onChange={() => onChange(slot.id)}
          />
          {`${slot.start_time} - ${slot.end_time}`}
        </label>
      ))}
    </div>
  );
};

export default AvailabilitySelector;
