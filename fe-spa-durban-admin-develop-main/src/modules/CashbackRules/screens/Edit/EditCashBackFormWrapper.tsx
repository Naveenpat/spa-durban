import { Formik, FormikHelpers, Form } from 'formik';
import React from 'react';
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
  };

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
    };
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
            onCancel={() => navigate('/cashback')}
            isLoading={isLoading}
          />
        </Form>
      )}
    </Formik>
  );
};

export default EditCashBackFormWrapper;
