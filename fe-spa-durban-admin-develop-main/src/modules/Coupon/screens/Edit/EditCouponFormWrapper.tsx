import { Formik, FormikHelpers, Form } from 'formik';
import React from 'react';
import { CouponFormValues } from '../../models/Coupon.model';
import CouponFormLayout from '../../components/CouponFormLayout';
import { date, object, string } from 'yup';
import {
  useGetCouponQuery,
  useUpdateCouponMutation,
} from '../../service/CouponServices';
import { useFetchData } from 'src/hooks/useFetchData';
import { showToast } from 'src/utils/showToaster';

type Props = {
  onClose: () => void;
  couponId: string;
};

const EditCouponFormWrapper = ({ onClose, couponId }: Props) => {
  const [updateCoupon] = useUpdateCouponMutation();
  const { data, isLoading } = useFetchData(useGetCouponQuery, {
    body: couponId,
    dataType: 'VIEW',
  });
  const initialValues: CouponFormValues = {
    type: { value: (data as any)?.data?.type },
    user: { _id: (data as any)?.data?.user },
    earnPoint: (data as any)?.data?.earnPoint,
    referralCode: (data as any)?.data?.referralCode,
    discountAmount: (data as any)?.data?.discountAmount,
    quantity: (data as any)?.data?.quantity,
    valid: (data as any)?.data?.valid || null,
    note: (data as any)?.data?.note,
  };

  const validationSchema = object().shape({
    // type: object().required('Please select type'),
    // user: object().test('test-user', 'Please select user', (value, context) => {
    //   if (context?.parent?.type?.value === 'REFERRAL_CODE') {
    //     if (!value) {
    //       return false;
    //     } else {
    //       return true;
    //     }
    //   }
    //   return true;
    // }),
    // earnPoint: string().test(
    //   'test-earnPoint',
    //   'Please enter  earn point',
    //   (value, context) => {
    //     if (context?.parent?.type?.value === 'REFERRAL_CODE') {
    //       if (!value) {
    //         return false;
    //       } else {
    //         return true;
    //       }
    //     }
    //     return true;
    //   },
    // ),
    referralCode: string().required('Please enter referral code'),
    discountAmount: string().required('Please enter discount (in %)'),
    quantity: string().required('Please enter quantity'),
    valid: date().required('Please enter date'),
    note: string().required('Please enter note'),
  });

  const handleSubmit = (
    values: CouponFormValues,
    { resetForm, setSubmitting }: FormikHelpers<CouponFormValues>,
  ) => {
    // let formattedValues;
    // if (values?.type?.value === 'REFERRAL_CODE') {
    //   formattedValues = {
    //     type: values?.type?.value,
    //     referralCode: values?.referralCode,
    //     discountAmount: values?.discountAmount,
    //     quantity: values?.quantity,
    //     valid: values?.valid || null,
    //     note: values?.note,
    //     user: values?.user?.value,
    //     earnPoint: values?.earnPoint,
    //   };
    // } else {
    //   formattedValues = {
    //     type: values?.type?.value,
    //     referralCode: values?.referralCode,
    //     discountAmount: values?.discountAmount,
    //     quantity: values?.quantity,
    //     valid: values?.valid || null,
    //     note: values?.note,
    //   };
    // }
    let formattedValues = {
      type: 'COUPON_CODE',
      referralCode: values?.referralCode,
      discountAmount: values?.discountAmount,
      quantity: values?.quantity,
      valid: values?.valid || null,
      note: values?.note,
    };

    updateCoupon({ body: formattedValues, couponId: couponId }).then(
      (res: any) => {
        if (res?.error) {
          showToast('error', res?.error?.data?.message);
        } else {
          if (res?.data?.status) {
            showToast('success', res?.data?.message);
            resetForm();
            onClose();
          } else {
            showToast('error', res?.data?.message);
          }
        }
        setSubmitting(false);
      },
    );
  };

  return (
    <Formik<CouponFormValues>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
      enableReinitialize
    >
      {(formikProps) => (
        <Form>
          <CouponFormLayout
            formikProps={formikProps}
            onClose={onClose}
            formType="EDIT"
            isLoading={isLoading}
          />
        </Form>
      )}
    </Formik>
  );
};

export default EditCouponFormWrapper;
