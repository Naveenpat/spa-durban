import { Formik, FormikHelpers, Form } from 'formik';
import React from 'react';
import { PromotionCouponsFormValues } from '../../models/PromotionCoupons.model';
import PromotionCouponsFormLayout from '../../components/PromotionCouponsFormLayout';
import { array, object, string } from 'yup';
import { useGetOutletsQuery } from 'src/modules/Outlet/service/OutletServices';
import { useFetchData } from 'src/hooks/useFetchData';
import { showToast } from 'src/utils/showToaster';
import { useAddPromotionCouponMutation } from '../../service/PromotionCouponsServices';
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

const AddPromotionCouponsFormWrapper = (props: Props) => {
  const navigate = useNavigate();
  const { data } = useFetchData(useGetOutletsQuery, {});
  const [addPromotionCoupons] = useAddPromotionCouponMutation();
  const initialValues: PromotionCouponsFormValues = {
    discountByPercentage: '',
    serviceId: '',
    customerId: '',
  };

  const validationSchema = object().shape({
    discountByPercentage: string().required(
      'Please enter discount by percentage',
    ),
    serviceId: array().of(object()).required('Please select service'),
    // customerId: array().of(object()).required('Please select customer'),
  });

  const handleSubmit = (
    values: PromotionCouponsFormValues,
    { resetForm, setSubmitting }: FormikHelpers<PromotionCouponsFormValues>,
  ) => {
    let formattedValues = {
      discountByPercentage: values?.discountByPercentage,
      serviceId: values?.serviceId?.map((serviceId: any) => serviceId?._id),
      customerId: values?.customerId?.map(
        (customerId: any) => customerId?.data?._id,
      ),
    };
    addPromotionCoupons(formattedValues).then((res: any) => {
      if (res?.error) {
        showToast('error', res?.error?.data?.message);
      } else {
        if (res?.data?.status) {
          showToast('success', res?.data?.message);
          resetForm();
          navigate('/promotion-coupons');
        } else {
          showToast('error', res?.data?.message);
        }
      }
      setSubmitting(false);
    });
  };

  return (
    <Formik<PromotionCouponsFormValues>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
      enableReinitialize
    >
      {(formikProps) => (
        <Form>
          <PromotionCouponsFormLayout
            formikProps={formikProps}
            formType="ADD"
            onCancel={() => navigate('/promotion-coupons')}
          />
        </Form>
      )}
    </Formik>
  );
};

export default AddPromotionCouponsFormWrapper;
