import { IconArrowBigDownLine, IconArrowBigUpLine } from '@tabler/icons-react';
import { FormikProps } from 'formik';
import React, { useState } from 'react';
import { ATMButton } from 'src/components/atoms/ATMButton/ATMButton';
import ATMMultiSelect from 'src/components/atoms/FormElements/ATMMultiSelect/ATMMultiSelect';
import ATMTextField from 'src/components/atoms/FormElements/ATMTextField/ATMTextField';
import { CashBackFormValues } from '../models/CashBack.model';
import ATMCircularProgress from 'src/components/atoms/ATMCircularProgress/ATMCircularProgress';
import ATMDatePicker from 'src/components/atoms/FormElements/ATMDatePicker/ATMDatePicker';
import { useGetItemsAllQuery } from 'src/modules/Product/service/ProductServices';
import { useFetchData } from 'src/hooks/useFetchData';
import ATMSelect from 'src/components/atoms/FormElements/ATMSelect/ATMSelect';
import ATMTimePicker from 'src/components/atoms/FormElements/ATMDatePicker/ATMTimePicker';
import ATMWeekdaySelect from 'src/components/atoms/FormElements/ATMDatePicker/ATMWeekdaySelect';
import ATMMaskedInput from 'src/components/atoms/FormElements/ATMMaskedInput/ATMMaskedInput';
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
  formikProps: FormikProps<CashBackFormValues>;
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
const CashBackFormLayout = ({
  formikProps,
  formType,
  onCancel,
  isLoading
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
        <div className="p-4 space-y-6">
          {/* Header */}
          <div className="sticky -top-2 flex items-center justify-between py-2 bg-white z-[10000]">
            <span className="text-lg font-semibold text-slate-700">
              {formType === 'ADD' ? 'Add' : 'Edit'} Cash Back
            </span>
            <div className="flex items-center gap-2">
              <ATMButton children="Cancel" variant="outlined" onClick={onCancel} />
              <ATMButton type="submit" isLoading={isSubmitting} children="Submit" />
            </div>
          </div>

          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ATMTextField
              required
              label="Cash Back Rules Name"
              name="cashBackRulesName"
              value={values.cashBackRulesName}
              onChange={(e) => setFieldValue('cashBackRulesName', e.target.value)}
              placeholder="Enter Cash Back Rules Name"
              onBlur={handleBlur}
              isTouched={touched.cashBackRulesName}
              errorMessage={errors.cashBackRulesName}
              isValid={!errors.cashBackRulesName}
            />

            <ATMNumberField
              name="howMuchCashback"
              label="Cashback Multiplier"
              value={values.howMuchCashback}
              onChange={(newValue) => setFieldValue('howMuchCashback', newValue)}
              placeholder="Cashback Multiplier"
              required
              isAllowDecimal={true}   // ✅ MUST BE TRUE to allow 1.2, 1.9, etc.
              isAllowSpaces={false}
              isAllowCharacter=""
            />





            <ATMMultiSelect
              name="serviceId"
              value={values?.serviceId || []}
              onChange={(newValue) => setFieldValue('serviceId', newValue)}
              label="Service"
              options={data}
              getOptionLabel={(opt) => opt?.itemName}
              valueAccessKey="_id"
              placeholder="Select Services"
            />
          </div>

          <ATMSelect
            required
            name="selectDateOrDays"
            value={values.selectDateOrDays}
            onChange={(newValue) => {
              setFieldValue('selectDateOrDays', newValue.value);
            }}
            label="Select Date/Date"
            placeholder="Select Date OR Days Wise"
            options={[
              { label: 'Days wise', value: 'days' },
              { label: 'Date wise', value: 'date' }
            ]}
            valueAccessKey="value"
          />

          {/* Row 2 */}
          {values.selectDateOrDays === 'date' && (<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ATMDatePicker
              required
              name="cashBackDate"
              dateFormat="dd/MM/yyyy"
              minDate={new Date()}
              value={values?.cashBackDate}
              onChange={(newValue) => setFieldValue('cashBackDate', newValue)}
              label="Start Date"
              placeholder="dd/MM/yyyy"
            />

            <ATMDatePicker
              required
              name="cashBackEndDate"
              dateFormat="dd/MM/yyyy"
              minDate={new Date()}
              value={values?.cashBackEndDate}
              onChange={(newValue) => setFieldValue('cashBackEndDate', newValue)}
              label="End Date"
              placeholder="dd/MM/yyyy"
            />


          </div>)}



          {/* Row 3 */}
          {values.selectDateOrDays === 'days' && (<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ATMWeekdaySelect
              name="activeDays"
              value={values.activeDays || []}
              onChange={(newValue) => setFieldValue('activeDays', newValue)}
              label="Days Applicable"
              options={weekdays.map((day) => ({ label: day, value: day }))}
            />

            <ATMTimePicker
              name="startTime"
              label="Start Time"
              value={values?.startTime || ''}
              onChange={(newValue) => setFieldValue('startTime', newValue)}
              placeholder="Select start time"
            />

            <ATMTimePicker
              name="endTime"
              label="End Time"
              value={values?.endTime || ''}
              onChange={(newValue) => setFieldValue('endTime', newValue)}
              placeholder="Select end time"
            />
          </div>)}

        </div>

      )}
    </>
  );
};

export default CashBackFormLayout;
