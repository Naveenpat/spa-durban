import { Formik, FormikHelpers, Form } from 'formik';
import React from 'react';
import { LoyaltyFormValues } from '../../models/Loyalty.model';
import LoyaltyFormLayout, {
  transformedData,
} from '../../components/LoyaltyFormLayout';
import { object, string } from 'yup';
import { useGetOutletQuery } from 'src/modules/Outlet/service/OutletServices';
import { useFetchData } from 'src/hooks/useFetchData';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useGetLoyaltyQuery,
  useGetLoyaltysQuery,
  useUpdateLoyaltyMutation,
} from '../../service/LoyaltyServices';
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

const EditLoyaltyFormWrapper = (props: Props) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [updateLoyalty] = useUpdateLoyaltyMutation();
  const { data: loyaltydata, isLoading } = useFetchData(useGetLoyaltyQuery, {
    body: id,
    dataType: 'VIEW',
  });
  const initialValues: LoyaltyFormValues = {
    outlets:
      (loyaltydata as any)?.data?.businessLocation?.map((outlet: any) => ({
        outlet: outlet?.outletName,
        spendAmount: outlet?.spentAmount,
        earnPoint: outlet?.earnPoint,
        daysWiseSetting: weekdays?.map((day) => {
          const dayKey = day.toLowerCase() + 'EarnPoint';
          const spendKey = day.toLowerCase() + 'SpendAmount';
          return {
            dayName: day,
            spendAmount: outlet[spendKey] || '',
            earnPoint: outlet[dayKey] || '',
          };
        }),
      })) || [],
    loyaltyProgramName: (loyaltydata as any)?.data?.loyaltyProgramName || '',
  };

  const validationSchema = object().shape({
    loyaltyProgramName: string().required('Please enter title'),
  });

  const handleSubmit = (
    values: LoyaltyFormValues,
    { resetForm, setSubmitting }: FormikHelpers<LoyaltyFormValues>,
  ) => {
    let formattedValues = {
      loyaltyProgramName: values?.loyaltyProgramName,
      businessLocation: transformedData(values?.outlets),
    };
    updateLoyalty({ body: formattedValues, loyaltyId: id }).then((res: any) => {
      if (res?.error) {
        showToast('error', res?.error?.data?.message);
      } else {
        if (res?.data?.status) {
          showToast('success', res?.data?.message);
          resetForm();
          navigate('/loyalty');
        } else {
          showToast('error', res?.data?.message);
        }
      }
      setSubmitting(false);
    });
  };

  return (
    <Formik<LoyaltyFormValues>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
      enableReinitialize
    >
      {(formikProps) => (
        <Form className="h-full">
          <LoyaltyFormLayout
            formikProps={formikProps}
            formType="EDIT"
            onCancel={() => navigate('/loyalty')}
            isLoading={isLoading}
          />
        </Form>
      )}
    </Formik>
  );
};

export default EditLoyaltyFormWrapper;
