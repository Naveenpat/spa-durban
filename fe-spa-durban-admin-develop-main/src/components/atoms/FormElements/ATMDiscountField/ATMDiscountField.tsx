import { ErrorMessage } from 'formik';
import React, { ChangeEvent, useState } from 'react';
import { createPortal } from 'react-dom';
import { getHeight, isValidNumber } from 'src/utils';
import { twMerge } from 'tailwind-merge';
import ATMFieldLabel from '../../ATMFieldLabel/ATMFieldLabel';

export type ATMDiscountFieldPropTypes = {
  name: string;
  value: string | string[];
  onChange: (e: string) => void;
  label?: string;
  size?: 'small' | 'medium' | 'large';
  type?: any;
  onDiscountTypeChange?: (newValue: any) => void;
  discountType: any;
  disableDiscountTypeChange?: boolean;
} & Omit<React.ComponentProps<'input'>, 'size'>;
const ATMDiscountField = ({
  name,
  value,
  className = 'bg-white rounded ',
  onChange,
  label,
  required,
  size = 'small',
  type = 'text',
  discountType,
  onDiscountTypeChange,
  disableDiscountTypeChange = false,
  ...rest
}: ATMDiscountFieldPropTypes) => {
  const discountTypeOptions = [
    {
      label: 'Flat',
      value: 'FLAT',
    },
    {
      label: 'Percent (%)',
      value: 'PERCENT',
    },
  ];
  const [targetData, setTargetData] = useState({
    top: 0,
    left: 0,
  });
  const [showPortal, setShowPortal] = useState(false);

  const handleValidPercent = (event: any): boolean => {
    return !isNaN(event) && event >= 0 && event <= 100;
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    event.target.value
      ? isValidNumber(event.target.value, { allowDecimals: true }) &&
        (discountType === 'PERCENT'
          ? handleValidPercent(event.target.value) &&
            onChange(event.target.value)
          : onChange(event.target.value))
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
            if (!disableDiscountTypeChange) {
              if (showPortal) {
                setShowPortal(false);
              } else {
                const clientRect = e.currentTarget.getBoundingClientRect();
                setTargetData({
                  top: clientRect.bottom + 8,
                  left: clientRect.left,
                });
                setShowPortal(true);
              }
            }
          }}
          className={`w-[100px] h-full bg-stone-200 border-slate-400 rounded-r  flex justify-center items-center text-sm text-slate-600 font-normal ${!disableDiscountTypeChange && 'cursor-pointer'}`}
        >
          {
            discountTypeOptions?.find(
              (option) => option?.value === discountType,
            )?.label
          }
        </div>
        {showPortal &&
          createPortal(
            <ul
              className="absolute  shadow w-[100px] z-[10000] bg-white rounded border"
              style={{
                top: targetData?.top,
                left: targetData?.left,
              }}
            >
              {discountTypeOptions?.map(
                (option: { label: string; value: string }) => {
                  const isSelected = option?.value === discountType;
                  return (
                    <li
                      key={option?.value}
                      onClick={() => {
                        onDiscountTypeChange?.(option?.value);
                        setShowPortal(false);
                      }}
                      className={`flex justify-center  text-slate-700 text-xs py-2 border-b cursor-pointer ${isSelected && 'bg-sky-300'}`}
                    >
                      {option?.label}
                    </li>
                  );
                },
              )}
            </ul>,
            document.body,
          )}
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
export default ATMDiscountField;
