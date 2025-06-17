import { Formik, FormikHelpers, Form } from 'formik';
import React, { useEffect, useState } from 'react';
import { CashBackFormValues } from '../../models/CashBack.model';
import CashBackFormLayout from '../../components/CashBackFormLayout';
import { object, string } from 'yup';
import { useGetOutletQuery } from 'src/modules/Outlet/service/OutletServices';
import { useFetchData } from 'src/hooks/useFetchData';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useGetCashBackQuery,
  useGetCashBacksQuery,
  useUpdateCashBackMutation,
} from '../../service/CashBackServices';
import { showToast } from 'src/utils/showToaster';

type Props = {};

const weekdays = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const EditCashBackFormWrapper = (props: Props) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [updateCashBack] = useUpdateCashBackMutation();
  const { data: cashbackData, isLoading } = useFetchData(useGetCashBackQuery, {
    body: id,
    dataType: 'VIEW',
  });

  const initialValues: CashBackFormValues = {
    cashBackRulesName: (cashbackData as any)?.data?.cashBackRulesName || '',
    howMuchCashback: {
      value: `${(cashbackData as any)?.data?.howMuchCashback || ''}`,
    },
    cashBackDate: (cashbackData as any)?.data?.cashBackDate || '',
    serviceId: (cashbackData as any)?.data?.serviceId || '',
    cashBackEndDate: (cashbackData as any)?.data?.cashBackEndDate || '',
    startTime: (cashbackData as any)?.data?.startTime || '',
    endTime: (cashbackData as any)?.data?.endTime || '',
    activeDays: (cashbackData as any)?.data?.activeDays || '',
    selectDateOrDays:''
  };

  

  useEffect(() => {
    if (initialValues.activeDays && initialValues.activeDays.length > 0) {
      initialValues.selectDateOrDays = 'days';
    } else {
       initialValues.selectDateOrDays = 'date';
    }
  }, [cashbackData]);


  const validationSchema = object().shape({
    cashBackRulesName: string().required('Please enter title'),
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
      startTime: values?.startTime,
      endTime: values?.endTime,
      activeDays: values?.selectDateOrDays === 'days' ? values?.activeDays : []
    };

//     let formattedValues: any = {
//   cashBackRulesName: values?.cashBackRulesName,
//   howMuchCashback: values?.howMuchCashback?.value,
//   serviceId: values?.serviceId?.map((serviceId: any) => serviceId?._id)
// };

// Conditionally include fields based on selection
// if (selectDateOrDays === 'days') {
//       formattedValues = {
//         ...formattedValues,
//         activeDays: values?.activeDays,
//         startTime: values?.startTime,
//         endTime: values?.endTime,
//         cashBackDate: null,
//         cashBackEndDate: null
//       };
//     } else if (selectDateOrDays === 'date') {
//       formattedValues = {
//         ...formattedValues,
//         cashBackDate: values?.cashBackDate,
//         cashBackEndDate: values?.cashBackEndDate,
//         activeDays: [],
//         startTime: null,
//         endTime: null
//       }
//     }

    updateCashBack({ body: formattedValues, cashBackId: id }).then(
      (res: any) => {
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
      },
    );
  };

  return (
    <Formik<CashBackFormValues>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
      enableReinitialize
    >
      {(formikProps) => (
        <Form className="h-full">
          <CashBackFormLayout
            formikProps={formikProps}
            formType="EDIT"
            onCancel={() => navigate('/cashback-rules')}
            isLoading={isLoading}
          />
        </Form>
      )}
    </Formik>
  );
};

export default EditCashBackFormWrapper;
