import { Formik, FormikHelpers, Form } from 'formik';
import React, { useState } from 'react';
import { CashBackFormValues } from '../../models/CashBack.model';
import CashBackFormLayout from '../../components/CashBackFormLayout';
import { object, string } from 'yup';
import { useGetOutletsQuery } from 'src/modules/Outlet/service/OutletServices';
import { useFetchData } from 'src/hooks/useFetchData';
import { showToast } from 'src/utils/showToaster';
import { useAddCashBackMutation } from '../../service/CashBackServices';
import { useNavigate } from 'react-router-dom';

type Props = {};

const AddCashBackFormWrapper = (props: Props) => {
  const navigate = useNavigate();
  const { data } = useFetchData(useGetOutletsQuery, {});
  const [addCashBack] = useAddCashBackMutation();

  const initialValues: CashBackFormValues = {
    cashBackRulesName: '',
    howMuchCashback: '',
    cashBackDate: new Date(),
    cashBackEndDate: new Date(),
    serviceId: '',
    startTime: '',
    endTime: '',
    activeDays: [],
    selectDateOrDays:''
  };

  const validationSchema = object().shape({
    cashBackRulesName: string().required('Please enter rule name'),
  });

  const handleSubmit = (
    values: CashBackFormValues,
    { resetForm, setSubmitting }: FormikHelpers<CashBackFormValues>,
  ) => {
    let formattedValues = {
      cashBackRulesName: values?.cashBackRulesName,
      howMuchCashback: values?.howMuchCashback?.value,
      cashBackDate: values?.cashBackDate,
      cashBackEndDate: values?.cashBackEndDate,
      serviceId: values?.serviceId?.map((serviceId: any) => serviceId?._id),
      startTime:values?.startTime,
      endTime:values?.endTime,
      activeDays:values?.activeDays
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
          navigate('/cashback-rules');
        } else {
          showToast('error', res?.data?.message);
        }
      }
      setSubmitting(false);
    });
  };

  return (
    <Formik<CashBackFormValues>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
      enableReinitialize
    >
      {(formikProps) => (
        <Form>
          <CashBackFormLayout
            formikProps={formikProps}
            formType="ADD"
            onCancel={() => navigate('/cashback-rules')}
          />
        </Form>
      )}
    </Formik>
  );
};

export default AddCashBackFormWrapper;
