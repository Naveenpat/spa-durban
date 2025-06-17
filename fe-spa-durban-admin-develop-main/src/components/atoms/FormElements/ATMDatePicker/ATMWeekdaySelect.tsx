// src/components/atoms/FormElements/ATMWeekdaySelect/ATMWeekdaySelect.tsx

import React from 'react';

type Option = {
  label: string;
  value: string;
};

type Props = {
  name: string;
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: Option[];
  placeholder?: string;
};

const ATMWeekdaySelect = ({ name, label, value, onChange, options }: Props) => {
  const toggleDay = (dayValue: string) => {
    if (value.includes(dayValue)) {
      onChange(value.filter((v) => v !== dayValue));
    } else {
      onChange([...value, dayValue]);
    }
  };

  return (
    <div className="flex flex-col gap-1">
  <label className="text-sm font-medium text-gray-700">{label}</label>
  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
    {options.map((day) => (
      <label
        key={day.value}
        className="flex items-center gap-2 text-sm text-gray-600"
      >
        <input
          type="checkbox"
          checked={value.includes(day.value)}
          onChange={() => toggleDay(day.value)}
          className="accent-blue-600"
        />
        {day.label}
      </label>
    ))}
  </div>
</div>

  );
};

export default ATMWeekdaySelect;
