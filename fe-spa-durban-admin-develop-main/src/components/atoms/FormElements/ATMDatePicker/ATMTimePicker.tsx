// src/components/atoms/FormElements/ATMTimePicker/ATMTimePicker.tsx

import React from 'react';

type Props = {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

const ATMTimePicker = ({ name, label, value, onChange, placeholder }: Props) => {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        type="time"
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border rounded p-2 text-sm"
        placeholder={placeholder}
      />
    </div>
  );
};

export default ATMTimePicker;
