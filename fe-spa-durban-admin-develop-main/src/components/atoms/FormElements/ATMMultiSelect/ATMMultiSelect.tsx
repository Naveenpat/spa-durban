import { ErrorMessage } from 'formik';
import { ReactNode, useRef, useState } from 'react';
import Select, { ActionMeta, OnChangeValue, StylesConfig } from 'react-select';
import makeAnimated from 'react-select/animated';
import { Size, getHeight } from '../../../../utils';
import ATMFieldError from '../../ATMFieldError/ATMFieldError';
import ATMFieldLabel from '../../ATMFieldLabel/ATMFieldLabel';
import { Variant } from '../ATMNumberField/ATMNumberField';

const animatedComponents = makeAnimated();

type Props = {
  name: string;
  value: any;
  onChange: (
    newValue: OnChangeValue<any, false>,
    actionMeta: ActionMeta<any>,
  ) => void;
  options: any;
  label: string;

  isTouched?: boolean;
  isValid?: boolean;
  valueAccessKey?: string;
  variant?: Variant;
  placeholder?: string;
  getOptionLabel?: (option: any) => string;
  formatOptionLabel?: (option: any) => ReactNode;
  formatValue?: (value: any) => ReactNode;
  isOptionDisabled?: (option: any) => boolean;
  isClearable?: boolean;
  closeMenuOnSelect?: boolean;
  minMenuHeight?: number;
  maxMenuHeight?: number;
  isLoading?: boolean;
  isDisabled?: boolean;
  loadingMessage?: (obj: { inputValue: string }) => string;
  menuPlacement?: 'auto' | 'top' | 'bottom';
  menuPosition?: 'fixed' | 'absolute';
  noOptionsMessage?: (obj: { inputValue: string }) => string;
  onBlur?: (e: any) => void;
  pageSize?: number;
  size?: Size;
};

const styles: StylesConfig<any> = {
  control: (baseStyles, state) => ({
    ...baseStyles,
    border: 'none',
    outlineColor: 'white',
    boxShadow: 'none',
    backgroundColor: 'transparent',
  }),
  container: (baseStyles, state) => ({
    ...baseStyles,
  }),
  menuPortal: (baseStyles, state) => ({
    ...baseStyles,
    zIndex: 10000,
  }),
};

const ATMMultiSelect = ({
  name,
  value,
  onChange,
  label,
  options,

  isTouched = false,
  isValid = true,
  valueAccessKey = 'id',
  variant = 'default',
  placeholder = 'Select...',
  getOptionLabel,
  formatOptionLabel,
  formatValue,
  isOptionDisabled,
  isClearable = true,
  closeMenuOnSelect = true,
  minMenuHeight = 300,
  maxMenuHeight = 300,
  isLoading = false,
  isDisabled = false,
  loadingMessage,
  menuPlacement = 'bottom',
  menuPosition = 'absolute',
  noOptionsMessage,
  onBlur,
  pageSize,
  size = 'small',
}: Props) => {
  const selectRef = useRef<any>(null);

  const [focused, setFocused] = useState<boolean>(false);
  const isOutlined = variant === 'outlined';

  return (
    <div
      onClick={() => {
        selectRef?.current?.focus();
        setFocused(true);
      }}
      className="relative"
    >
      <ATMFieldLabel htmlFor={name} hidden={isOutlined}>
        {label}
      </ATMFieldLabel>
      <div
        className={`relative rounded flex flex-col ${getHeight(size)} ${
          isOutlined && 'justify-end'
        } ${isDisabled && 'opacity-60'}  border  ${
          focused && !isDisabled ? 'border-primary-light' : 'border-gray-300'
        }`}
      >
        <label
          className={`absolute left-2 transition-all duration-200 z-10000 ${
            isTouched && !isValid && 'text-red-400'
          }  ${
            focused || value
              ? 'top-0 text-primary-main font-medium  text-sm'
              : 'top-1/2 transform -translate-y-1/2 text-sm text-gray-400 cursor-text'
          }  ${!isOutlined && 'hidden'} `}
        >
          {label}
        </label>

        <Select
          name={name}
          value={value?.map((el: any) => {
            return options?.find(
              (option: any) =>
                option?.[valueAccessKey] ===
                (typeof el === 'string' ? el : el?.[valueAccessKey]),
            );
          })}
          onChange={(newValue, actionMeta) => {
            onChange(newValue, actionMeta);
            selectRef?.current?.focus?.(true);
          }}
          options={options}
          isClearable={isClearable}
          closeMenuOnSelect={closeMenuOnSelect}
          getOptionLabel={getOptionLabel}
          getOptionValue={(option) => option?.[valueAccessKey]}
          formatOptionLabel={(data, { selectValue, context }) => {
            if (context === 'menu') {
              return (
                formatOptionLabel?.(data) ||
                getOptionLabel?.(data) ||
                data?.label
              );
            } else {
              return (
                formatValue?.(data) || getOptionLabel?.(data) || data?.label
              );
            }
          }}
          isOptionDisabled={isOptionDisabled}
          loadingMessage={loadingMessage}
          isDisabled={isDisabled}
          isLoading={isLoading}
          minMenuHeight={minMenuHeight}
          maxMenuHeight={maxMenuHeight}
          menuPlacement={menuPlacement}
          menuPosition={menuPosition}
          noOptionsMessage={noOptionsMessage}
          pageSize={pageSize}
          placeholder={isOutlined ? (focused ? placeholder : '') : placeholder}
          onBlur={(e) => {
            onBlur?.(e);
            setFocused(false);
          }}
          ref={selectRef}
          defaultMenuIsOpen={false}
          menuShouldBlockScroll
          styles={styles}
          isMulti={true}
          controlShouldRenderValue
          components={animatedComponents}
          classNames={{
            valueContainer: () => 'text-xs',
            option: () => '!text-xs',
          }}
        />
      </div>

      <ErrorMessage name={name}>
        {(errorMessage) => <ATMFieldError> {errorMessage} </ATMFieldError>}
      </ErrorMessage>
    </div>
  );
};

export default ATMMultiSelect;
