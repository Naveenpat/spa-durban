import { IconArrowBigDownLine, IconArrowBigUpLine } from '@tabler/icons-react';
import { ErrorMessage, FormikProps } from 'formik';
import React, { useState, useRef, useCallback } from 'react';
import { ATMButton } from 'src/components/atoms/ATMButton/ATMButton';
import ATMMultiSelect from 'src/components/atoms/FormElements/ATMMultiSelect/ATMMultiSelect';
import ATMTextField from 'src/components/atoms/FormElements/ATMTextField/ATMTextField';
import ATMNumberField from 'src/components/atoms/FormElements/ATMNumberField/ATMNumberField';
import { PromotionCouponsFormValues } from '../models/PromotionCoupons.model';
import ATMCircularProgress from 'src/components/atoms/ATMCircularProgress/ATMCircularProgress';
import ATMDatePicker from 'src/components/atoms/FormElements/ATMDatePicker/ATMDatePicker';
import { useGetItemsAllQuery } from 'src/modules/Product/service/ProductServices';
import { useFetchData } from 'src/hooks/useFetchData';
import ATMSelect from 'src/components/atoms/FormElements/ATMSelect/ATMSelect';
import AsyncSelect from 'react-select/async';
import { BASE_URL } from '../../../utils/constants/index';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store';
import ATMFieldError from 'src/components/atoms/ATMFieldError/ATMFieldError';

const typeOption = [
  {
    label: '2X',
    value: '2',
  },
  {
    label: '3X',
    value: '3',
  },
  {
    label: '4X',
    value: '4',
  },
  {
    label: '5X',
    value: '5',
  },
  {
    label: '6X',
    value: '6',
  },
  {
    label: '7X',
    value: '7',
  },
  {
    label: '8X',
    value: '8',
  },
  {
    label: '9X',
    value: '9',
  },
  {
    label: '10X',
    value: '10',
  },
];

type Props = {
  formikProps: FormikProps<PromotionCouponsFormValues>;
  formType: 'ADD' | 'EDIT';
  onCancel: () => void;
  isLoading?: boolean;
};
interface Customer {
  _id: string;
  bookingCustomerId: string;
  customerName: string;
  email: string;
  phone: string;
  isActive: boolean;
  isDeleted: boolean;
}
interface SelectOption {
  label: string;
  value: string;
  data: Customer;
}
const weekdays = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];
const useDebounce = (callback: Function, delay: number) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: any[]) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay],
  );
};
const PromotionCouponsFormLayout = ({
  formikProps,
  formType,
  onCancel,
  isLoading,
}: Props) => {
  const { values, setFieldValue, isSubmitting, handleBlur, touched, errors } =
    formikProps;
  const [loading, setLoading] = useState(false);
  const { userData, outlet, accessToken } = useSelector(
    (state: RootState) => state.auth,
  );
  const [visibleoutletes, setVisibleoutletes] = useState<{
    [key: number]: boolean;
  }>({});
  const [searchValue, setSearchValue] = useState('');
  const { data, refetch } = useFetchData(useGetItemsAllQuery, {
    body: {
      searchValue: searchValue,
      filterBy: JSON.stringify([
        {
          fieldName: 'categoryId',
          value: [],
        },
      ]),
    },
    options: {
      skip: false,
    },
  });
  const toggleVisibility = (index: number) => {
    setVisibleoutletes((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };
  const fetchOptions = async (inputValue: any): Promise<SelectOption[]> => {
    if (!inputValue) return [];

    try {
      const filterBy = JSON.stringify([
        {
          fieldName: 'customerName',
          value: inputValue,
        },
      ]);
      const response = await fetch(
        `${BASE_URL}/customer/pagination?isPaginationRequired=false&filterBy=${filterBy}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );
      const data = await response.json();
      // console.log(data, 'data===============');

      return data?.data?.map((item: any) => ({
        label: `${item.customerName} - ${item?.phone} - ${item?.email}`,
        value: item._id,
        data: item,
      }));
    } catch (error) {
      console.error('Error fetching options:', error);
      return [];
    }
  };
  const debouncedLoadOptions = useDebounce(
    async (inputValue: any, callback: (arg0: any[]) => void) => {
      setLoading(true);
      const options = await fetchOptions(inputValue);
      setLoading(false);
      callback(options);
    },
    1000,
  );
  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <ATMCircularProgress />
        </div>
      ) : (
        <div className="p-4">
          <div className="sticky -top-2  flex items-center justify-between py-2 bg-white z-[10000]">
            <span className="text-lg font-semibold text-slate-700">
              {formType === 'ADD' ? 'Add' : 'Edit'} Promotion Coupons
            </span>
            <div className="flex items-center gap-2">
              <div>
                <ATMButton
                  children="Cancel"
                  variant="outlined"
                  onClick={onCancel}
                />
              </div>
              <div>
                <ATMButton
                  type="submit"
                  isLoading={isSubmitting}
                  children="Submit"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-row gap-2">
            <div className="w-[300px]">
              <ATMNumberField
                required
                label="Discount by Percentage"
                name={`discountByPercentage`}
                value={values.discountByPercentage}
                onChange={(newValue) =>
                  setFieldValue(`discountByPercentage`, newValue)
                }
                placeholder="Enter Discount In Percentage"
                onBlur={handleBlur}
                isTouched={touched.discountByPercentage}
                errorMessage={errors.discountByPercentage}
                isValid={!errors.discountByPercentage}
              />
            </div>
            <div className="w-[300px]">
              <ATMMultiSelect
                name="serviceId"
                value={values?.serviceId || []}
                onChange={(newValue) => setFieldValue('serviceId', newValue)}
                label="Service"
                options={data}
                getOptionLabel={(options) => options?.itemName}
                valueAccessKey="_id"
                placeholder="Please Select Service"
              />
            </div>
            <div className="w-[300px]">
              {/* <ATMMultiSelect
                name="customerId"
                value={values?.customerId || []}
                onChange={(newValue) => setFieldValue('customerId', newValue)}
                label="Customer"
                options={data}
                getOptionLabel={(options) => options?.itemName}
                valueAccessKey="_id"
                placeholder="Please Select Customer"
              /> */}
              <label className="text-xs font-medium tracking-wide text-slate-500  false ">
                Select Customer
              </label>
              <AsyncSelect
                cacheOptions
                defaultOptions
                loadOptions={debouncedLoadOptions}
                value={values?.customerId || []} // ✅ Set initial value
                onChange={(newValue) => {
                  // console.log(newValue, 'newValue==============');

                  setFieldValue('customerId', newValue);
                }}
                placeholder="Search..."
                isLoading={loading}
                isClearable
                isMulti
              />
              {/* <ErrorMessage name={values?.customerId}>
                {(errorMessage) => (
                  <ATMFieldError> {errorMessage} </ATMFieldError>
                )}
              </ErrorMessage> */}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PromotionCouponsFormLayout;
