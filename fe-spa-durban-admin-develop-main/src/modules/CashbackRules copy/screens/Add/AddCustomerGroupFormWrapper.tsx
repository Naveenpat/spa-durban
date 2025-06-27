import { Formik, FormikHelpers, Form } from 'formik';
import React, { useState } from 'react';
import { object, string } from 'yup';
import { useGetOutletsQuery } from 'src/modules/Outlet/service/OutletServices';
import { useFetchData } from 'src/hooks/useFetchData';
import { showToast } from 'src/utils/showToaster';
import { useNavigate } from 'react-router-dom';
import { CustomerGroupFormValues } from '../../models/CustomerGroup.model';
import CustomerGroupFormLayout from '../../components/CustomerGroupFormLayout';
import { useAddCustomerGroupMutation } from '../../service/CustomerGroupServices';

type Props = {};

const AddCustomerGroupFormWrapper = (props: Props) => {
  const navigate = useNavigate();
  const { data } = useFetchData(useGetOutletsQuery, {});
  const [addCashBack] = useAddCustomerGroupMutation();

  const initialValues: CustomerGroupFormValues = {
    customerGroupName: ''
  };

  const validationSchema = object().shape({
    customerGroupName: string().required('Please enter cashback group name'),
  });

  const handleSubmit = (
    values: CustomerGroupFormValues,
    { resetForm, setSubmitting }: FormikHelpers<CustomerGroupFormValues>,
  ) => {
    let formattedValues = {
      customerGroupName: values?.customerGroupName
    };

    // let formattedValues: any = {
    //   cashBackRulesName: values?.cashBackRulesName,
    //   howMuchCashback: values?.howMuchCashback?.value,
    //   serviceId: values?.serviceId?.map((serviceId: any) => serviceId?._id),
    //   selectDateOrDays: selectDateOrDays
    // };

    // // Conditionally include fields based on selection
    // if (selectDateOrDays === 'days') {
    //   formattedValues = {
    //     ...formattedValues,
    //     activeDays: values?.activeDays,
    //     startTime: values?.startTime,
    //     endTime: values?.endTime,
    //     cashBackDate: null,
    //     cashBackEndDate: null
    //   };
    // } else if (selectDateOrDays === 'date') {
    //   formattedValues = {
    //     ...formattedValues,
    //     cashBackDate: values?.cashBackDate,
    //     cashBackEndDate: values?.cashBackEndDate,
    //     activeDays: [],
    //     startTime: null,
    //     endTime: null
    //   };
    // }

    console.log('------formattedValues', formattedValues)
    addCashBack(formattedValues).then((res: any) => {
      if (res?.error) {
        showToast('error', res?.error?.data?.message);
      } else {
        if (res?.data?.status) {
          showToast('success', res?.data?.message);
          resetForm();
          navigate('/customer-group');
        } else {
          showToast('error', res?.data?.message);
        }
      }
      setSubmitting(false);
    });
  };

  return (
    <Formik<CustomerGroupFormValues>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
      enableReinitialize
    >
      {(formikProps) => (
        <Form>
          <CustomerGroupFormLayout
            formikProps={formikProps}
            formType="ADD"
            onCancel={() => navigate('/customer-group')}
          />
        </Form>
      )}
    </Formik>
  );
};

export default AddCustomerGroupFormWrapper;
