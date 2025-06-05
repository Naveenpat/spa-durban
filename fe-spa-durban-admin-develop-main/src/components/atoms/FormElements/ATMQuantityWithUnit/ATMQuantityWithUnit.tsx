import { ErrorMessage } from 'formik';
import React, { ChangeEvent, useState } from 'react';
import { createPortal } from 'react-dom';
import { getHeight, isValidNumber } from 'src/utils';
import { twMerge } from 'tailwind-merge';
import ATMFieldLabel from '../../ATMFieldLabel/ATMFieldLabel';

export type ATMQuantityWithUnitPropTypes = {
  name: string;
  value: string | string[];
  onChange: (e: string) => void;
  label?: string;
  size?: 'small' | 'medium' | 'large';
  type?: any;
  onUnitChange?: (newValue: any) => void;
  unitValue: any;
  disableValueChange?: boolean;
} & Omit<React.ComponentProps<'input'>, 'size'>;
const ATMQuantityWithUnit = ({
  name,
  value,
  className = 'bg-white rounded ',
  onChange,
  label,
  required,
  size = 'small',
  type = 'text',
  unitValue,
  onUnitChange,
  disableValueChange = false,
  ...rest
}: ATMQuantityWithUnitPropTypes) => {
  const units = [
    {
      unitName: 'kilogram',
      abbr: 'kg',
      _id: '1',
    },
    {
      unitName: 'gram',
      abbr: 'gm',
      _id: '2',
    },
    {
      unitName: 'ounce',
      abbr: 'oz',
      _id: '3',
    },
  ];
  const [targetData, setTargetData] = useState({
    top: 0,
    left: 0,
  });
  const [showUnitPortal, setShowUnitPortal] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    event.target.value
      ? isValidNumber(event.target.value, { allowDecimals: true }) &&
        onChange(event.target.value)
      : onChange(event.target.value);
  };
  return (
    <div className="relative">
      <ATMFieldLabel htmlFor={name}>{label}</ATMFieldLabel>

      <div
        className={`flex border  ${getHeight(size)} border-neutral-80 outline-none ${label && 'mt-1'}  ${className}`}
      >
        <input
          type={type}
          name={name}
          value={value}
          onChange={handleChange}
          className={twMerge(
            `rounded-md flex-1 w-full bg-inherit focus:outline-none px-2 py-1 ${className} placeholder:text-xs text-xs`,
          )}
          {...rest}
        />
        <div
          onClick={(e) => {
            if (!disableValueChange) {
              if (showUnitPortal) {
                setShowUnitPortal(false);
              } else {
                const clientRect = e.currentTarget.getBoundingClientRect();
                setTargetData({
                  top: clientRect.bottom + 8,
                  left: clientRect.left,
                });
                setShowUnitPortal(true);
              }
            }
          }}
          className={`w-[100px] h-full bg-stone-200 border-slate-400 rounded-r  flex justify-center items-center text-sm text-slate-600 font-normal ${!disableValueChange && 'cursor-pointer'}`}
        >
          {unitValue}
        </div>
        {/* {showUnitPortal &&
          createPortal(
            <ul
              className="absolute  shadow w-[100px] z-[10000] bg-white rounded border"
              style={{
                top: targetData?.top,
                left: targetData?.left,
              }}
            >
              {units?.map((unit: any) => {
                const isSelected = unit?.abbr === unitValue?.abbr;
                return (
                  <li
                    key={unit?.abbr}
                    onClick={() => {
                      onUnitChange?.(unit);
                      setShowUnitPortal(false);
                    }}
                    className={`flex justify-center  text-slate-700 text-xs py-2 border-b cursor-pointer ${isSelected && 'bg-sky-300'}`}
                  >
                    {unit?.unitName} ({unit?.abbr})
                  </li>
                );
              })}
            </ul>,
            document.body,
          )} */}
      </div>
      {name && (
        <ErrorMessage name={name}>
          {(errMsg) => (
            <p className="font-poppins absolute text-[14px] text-start mt-0 text-red-500">
              {errMsg}
            </p>
          )}
        </ErrorMessage>
      )}
    </div>
  );
};
export default ATMQuantityWithUnit;
