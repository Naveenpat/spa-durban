import { Formik, FormikHelpers, Form } from 'formik';
import React from 'react';
import { RewardsCouponFormValues } from '../../models/RewardsCoupon.model';
import RewardsCouponFormLayout from '../../components/RewardsCouponFormLayout';
import { array, object, string } from 'yup';
import { useGetOutletsQuery } from 'src/modules/Outlet/service/OutletServices';
import { useFetchData } from 'src/hooks/useFetchData';
import { showToast } from 'src/utils/showToaster';
import { useAddRewardsCouponMutation } from '../../service/RewardsCouponServices';
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

const AddRewardsCouponFormWrapper = (props: Props) => {
  const navigate = useNavigate();
  const { data } = useFetchData(useGetOutletsQuery, {});
  const [addRewardsCoupon] = useAddRewardsCouponMutation();
  const initialValues: RewardsCouponFormValues = {
    rewardsPoint: '',
    serviceId: '',
  };

  const validationSchema = object().shape({
    rewardsPoint: string().required('Please enter point'),
    serviceId: array().of(object()).required('Please select service'),
  });

  const handleSubmit = (
    values: RewardsCouponFormValues,
    { resetForm, setSubmitting }: FormikHelpers<RewardsCouponFormValues>,
  ) => {
    let formattedValues = {
      rewardsPoint: values?.rewardsPoint,
      // howMuchRewardsCoupon: values?.howMuchRewardsCoupon?.value,
      // rewardsCouponDate: values?.rewardsCouponDate,
      serviceId: values?.serviceId?.map((serviceId: any) => serviceId?._id),
    };
    addRewardsCoupon(formattedValues).then((res: any) => {
      if (res?.error) {
        showToast('error', res?.error?.data?.message);
      } else {
        if (res?.data?.status) {
          showToast('success', res?.data?.message);
          resetForm();
          navigate('/rewards-coupon');
        } else {
          showToast('error', res?.data?.message);
        }
      }
      setSubmitting(false);
    });
  };

  return (
    <Formik<RewardsCouponFormValues>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
      enableReinitialize
    >
      {(formikProps) => (
        <Form>
          <RewardsCouponFormLayout
            formikProps={formikProps}
            formType="ADD"
            onCancel={() => navigate('/rewards-coupon')}
          />
        </Form>
      )}
    </Formik>
  );
};

export default AddRewardsCouponFormWrapper;
