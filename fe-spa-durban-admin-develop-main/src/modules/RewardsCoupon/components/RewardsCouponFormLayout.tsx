import { IconArrowBigDownLine, IconArrowBigUpLine } from '@tabler/icons-react';
import { FormikProps } from 'formik';
import React, { useState } from 'react';
import { ATMButton } from 'src/components/atoms/ATMButton/ATMButton';
import ATMMultiSelect from 'src/components/atoms/FormElements/ATMMultiSelect/ATMMultiSelect';
import ATMTextField from 'src/components/atoms/FormElements/ATMTextField/ATMTextField';
import { RewardsCouponFormValues } from '../models/RewardsCoupon.model';
import ATMCircularProgress from 'src/components/atoms/ATMCircularProgress/ATMCircularProgress';
import ATMDatePicker from 'src/components/atoms/FormElements/ATMDatePicker/ATMDatePicker';
import { useGetItemsAllQuery } from 'src/modules/Product/service/ProductServices';
import { useFetchData } from 'src/hooks/useFetchData';
import ATMSelect from 'src/components/atoms/FormElements/ATMSelect/ATMSelect';
import ATMNumberField from 'src/components/atoms/FormElements/ATMNumberField/ATMNumberField';
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
  formikProps: FormikProps<RewardsCouponFormValues>;
  formType: 'ADD' | 'EDIT';
  onCancel: () => void;
  isLoading?: boolean;
};
const weekdays = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];
const RewardsCouponFormLayout = ({
  formikProps,
  formType,
  onCancel,
  isLoading,
}: Props) => {
  const { values, setFieldValue, isSubmitting, handleBlur, touched, errors } =
    formikProps;

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
              {formType === 'ADD' ? 'Add' : 'Edit'} Rewards Coupon
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
                label="Rewards Point"
                name={`rewardsPoint`}
                value={values.rewardsPoint}
                onChange={(newValue) => setFieldValue(`rewardsPoint`, newValue)}
                placeholder="Enter Rewards Point"
                onBlur={handleBlur}
                isTouched={touched.rewardsPoint}
                errorMessage={errors.rewardsPoint}
                isValid={!errors.rewardsPoint}
              />
            </div>
            <div className="w-[600px]">
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
            {/* <div className="w-[300px]">
              <ATMSelect
                required
                name="howMuchRewardsCoupon"
                value={values.howMuchRewardsCoupon}
                onChange={(newValue) =>
                  setFieldValue('howMuchRewardsCoupon', newValue)
                }
                label="Type"
                placeholder="Select How Much Rewards"
                options={typeOption}
                valueAccessKey="value"
              />
            </div> */}
            {/* <div className="w-[300px]">
              <ATMDatePicker
                required
                name="rewardsCouponDate"
                dateFormat="MM/dd/yyyy"
                minDate={new Date()}
                value={values?.rewardsCouponDate}
                onChange={(newValue) =>
                  setFieldValue('rewardsCouponDate', newValue)
                }
                label="Date"
                placeholder="mm/dd/yyyy"
              />
            </div> */}
          </div>
        </div>
      )}
    </>
  );
};

export default RewardsCouponFormLayout;
