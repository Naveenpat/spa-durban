import { Formik, FormikHelpers, Form } from 'formik';
import React from 'react';
import { LoyaltyFormValues } from '../../models/Loyalty.model';
import LoyaltyFormLayout, {
  transformedData,
} from '../../components/LoyaltyFormLayout';
import { object, string } from 'yup';
import { useGetOutletsQuery } from 'src/modules/Outlet/service/OutletServices';
import { useFetchData } from 'src/hooks/useFetchData';
import { showToast } from 'src/utils/showToaster';
import { useAddLoyaltyMutation } from '../../service/LoyaltyServices';
import { useNavigate } from 'react-router-dom';

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

const AddLoyaltyFormWrapper = (props: Props) => {
  const navigate = useNavigate();
  const { data } = useFetchData(useGetOutletsQuery, {});
  const [addLoyalty] = useAddLoyaltyMutation();
  const initialValues: LoyaltyFormValues = {
    outlets: data?.map((outlet) => ({
      outlet: outlet,
      spendAmount: '',
      earnPoint: '',
      daysWiseSetting: weekdays?.map((day) => ({
        dayName: day,
        spendAmount: '',
        earnPoint: '',
      })),
    })),
    loyaltyProgramName: '',
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
    addLoyalty(formattedValues).then((res: any) => {
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
        <Form>
          <LoyaltyFormLayout
            formikProps={formikProps}
            formType="ADD"
            onCancel={() => navigate('/loyalty')}
          />
        </Form>
      )}
    </Formik>
  );
};

export default AddLoyaltyFormWrapper;
