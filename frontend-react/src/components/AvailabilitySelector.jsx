import React from "react";

const AvailabilitySelector = ({ day, timeSlots, selected, onChange }) => {
  return (
    <div>
      <h3>{day} 可用時段</h3>
      {timeSlots.map((slot) => (
        <label key={slot} style={{ marginRight: "10px" }}>
          <input
            type="checkbox"
            checked={selected.includes(slot)}
            onChange={() => onChange(slot)}
          />
          {slot}
        </label>
      ))}
    </div>
  );
};

export default AvailabilitySelector;