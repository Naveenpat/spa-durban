import { Formik, FormikHelpers, Form } from 'formik';
import React from 'react';
import { RewardsCouponFormValues } from '../../models/RewardsCoupon.model';
import RewardsCouponFormLayout from '../../components/RewardsCouponFormLayout';
import { object, string } from 'yup';
import { useGetOutletQuery } from 'src/modules/Outlet/service/OutletServices';
import { useFetchData } from 'src/hooks/useFetchData';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useGetRewardsCouponQuery,
  useUpdateRewardsCouponMutation,
} from '../../service/RewardsCouponServices';
import { showToast } from 'src/utils/showToaster';

type Props = {};

const EditRewardsCouponFormWrapper = (props: Props) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [updateRewardsCoupon] = useUpdateRewardsCouponMutation();
  const { data: rewardsCouponData, isLoading } = useFetchData(
    useGetRewardsCouponQuery,
    {
      body: id,
      dataType: 'VIEW',
    },
  );
  const initialValues: RewardsCouponFormValues = {
    rewardsPoint: (rewardsCouponData as any)?.data?.rewardsPoint || '',
    serviceId: (rewardsCouponData as any)?.data?.serviceId || '',
  };

  const validationSchema = object().shape({
    rewardsPoint: string().required('Please enter title'),
  });

  const handleSubmit = (
    values: RewardsCouponFormValues,
    { resetForm, setSubmitting }: FormikHelpers<RewardsCouponFormValues>,
  ) => {
    let formattedValues = {
      rewardsPoint: values?.rewardsPoint,
      serviceId: Array.isArray(values?.serviceId)
        ? values?.serviceId.map((serviceId: any) =>
            typeof serviceId === 'object' ? serviceId._id : serviceId,
          )
        : [],
    };
    updateRewardsCoupon({ body: formattedValues, rewardsCouponId: id }).then(
      (res: any) => {
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
      },
    );
  };

  return (
    <Formik<RewardsCouponFormValues>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
      enableReinitialize
    >
      {(formikProps) => (
        <Form className="h-full">
          <RewardsCouponFormLayout
            formikProps={formikProps}
            formType="EDIT"
            onCancel={() => navigate('/rewards-coupon')}
            isLoading={isLoading}
          />
        </Form>
      )}
    </Formik>
  );
};

export default EditRewardsCouponFormWrapper;
