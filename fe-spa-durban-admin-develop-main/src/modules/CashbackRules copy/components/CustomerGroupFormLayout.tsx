import { IconArrowBigDownLine, IconArrowBigUpLine } from '@tabler/icons-react';
import { FormikProps } from 'formik';
import React, { useState } from 'react';
import { ATMButton } from 'src/components/atoms/ATMButton/ATMButton';
import ATMMultiSelect from 'src/components/atoms/FormElements/ATMMultiSelect/ATMMultiSelect';
import ATMTextField from 'src/components/atoms/FormElements/ATMTextField/ATMTextField';
import ATMCircularProgress from 'src/components/atoms/ATMCircularProgress/ATMCircularProgress';
import ATMDatePicker from 'src/components/atoms/FormElements/ATMDatePicker/ATMDatePicker';
import { useGetItemsAllQuery } from 'src/modules/Product/service/ProductServices';
import { useFetchData } from 'src/hooks/useFetchData';
import ATMSelect from 'src/components/atoms/FormElements/ATMSelect/ATMSelect';
import ATMTimePicker from 'src/components/atoms/FormElements/ATMDatePicker/ATMTimePicker';
import ATMWeekdaySelect from 'src/components/atoms/FormElements/ATMDatePicker/ATMWeekdaySelect';
import ATMMaskedInput from 'src/components/atoms/FormElements/ATMMaskedInput/ATMMaskedInput';
import ATMNumberField from 'src/components/atoms/FormElements/ATMNumberField/ATMNumberField';
import { CustomerGroupFormValues } from '../models/CustomerGroup.model';

type Props = {
  formikProps: FormikProps<CustomerGroupFormValues>;
  formType: 'ADD' | 'EDIT';
  onCancel: () => void;
  isLoading?: boolean;
};

const CustomerGroupFormLayout = ({
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
              label="Customer Group Name"
              name="customerGroupName"
              value={values.customerGroupName}
              onChange={(e) => setFieldValue('customerGroupName', e.target.value)}
              placeholder="Enter customer group name"
              onBlur={handleBlur}
              isTouched={touched.customerGroupName}
              errorMessage={errors.customerGroupName}
              isValid={!errors.customerGroupName}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerGroupFormLayout;
