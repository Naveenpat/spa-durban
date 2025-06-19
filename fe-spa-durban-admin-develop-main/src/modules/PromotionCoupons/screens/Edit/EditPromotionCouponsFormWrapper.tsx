import { Formik, FormikHelpers, Form } from 'formik';
import React from 'react';
import { PromotionCouponsFormValues } from '../../models/PromotionCoupons.model';
import PromotionCouponsFormLayout from '../../components/PromotionCouponsFormLayout';
import { object, string } from 'yup';
import { useGetOutletQuery } from 'src/modules/Outlet/service/OutletServices';
import { useFetchData } from 'src/hooks/useFetchData';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useGetPromotionCouponQuery,
  useUpdatePromotionCouponMutation,
} from '../../service/PromotionCouponsServices';
import { showToast } from 'src/utils/showToaster';

type Props = {};

const EditPromotionCouponsFormWrapper = (props: Props) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [updatePromotionCoupons] = useUpdatePromotionCouponMutation();
  const { data: promotionCouponsData, isLoading } = useFetchData(
    useGetPromotionCouponQuery,
    {
      body: id,
      dataType: 'VIEW',
    },
  );
  const initialValues: PromotionCouponsFormValues = {
    discountByPercentage:
      (promotionCouponsData as any)?.data?.discountByPercentage || '',
    serviceId: (promotionCouponsData as any)?.data?.serviceId || '',
    customerId: (promotionCouponsData as any)?.data?.customerId || '',
    startDate: (promotionCouponsData as any)?.data?.startDate || '',
    endDate: (promotionCouponsData as any)?.data?.endDate || '',
    groupTarget: (promotionCouponsData as any)?.data?.groupTarget || []

  };

  const validationSchema = object().shape({
    discountByPercentage: string().required('Please enter title'),
  });

  const handleSubmit = (
    values: PromotionCouponsFormValues,
    { resetForm, setSubmitting }: FormikHelpers<PromotionCouponsFormValues>,
  ) => {
    let formattedValues = {
      discountByPercentage: values?.discountByPercentage,
      serviceId: Array.isArray(values?.serviceId)
        ? values?.serviceId.map((serviceId: any) =>
          typeof serviceId === 'object' ? serviceId._id : serviceId,
        )
        : [],
      customerId: Array.isArray(values?.customerId)
        ? values?.customerId.map((customerId: any) =>
          typeof customerId === 'object' ? customerId._id : customerId,
        )
        : [],
      startDate:values?.startDate,
      endDate:values?.endDate,
       groupTarget: (values?.groupTarget as any[]).map((group) => group._id)
      // customerId: values?.customerId?.map((customerId: any) => customerId?._id),
    };
    updatePromotionCoupons({
      body: formattedValues,
      promotionCouponId: id,
    }).then((res: any) => {
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
        <Form className="h-full">
          <PromotionCouponsFormLayout
            formikProps={formikProps}
            formType="EDIT"
            onCancel={() => navigate('/promotion-coupons')}
            isLoading={isLoading}
          />
        </Form>
      )}
    </Formik>
  );
};

export default EditPromotionCouponsFormWrapper;
