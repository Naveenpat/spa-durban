import { Formik, FormikHelpers, Form } from 'formik';
import React from 'react';
import { CouponFormValues } from '../../models/Coupon.model';
import CouponFormLayout from '../../components/CouponFormLayout';
import { date, object, string } from 'yup';
import { useAddCouponMutation } from '../../service/CouponServices';
import { showToast } from 'src/utils/showToaster';
import { on } from 'process';

type Props = {
  onClose: () => void;
};

const AddCouponFormWrapper = ({ onClose }: Props) => {
  const [addCoupon] = useAddCouponMutation();
  const initialValues: CouponFormValues = {
    type: '',
    user: '',
    earnPoint: '0',
    referralCode: '',
    discountAmount: '',
    quantity: '',
    valid: null,
    note: '',
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
    //   'Please enter earn point',
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
    //     user: values?.user?._id,
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

    addCoupon(formattedValues).then((res: any) => {
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
    });
  };

  return (
    <Formik<CouponFormValues>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {(formikProps) => (
        <Form>
          <CouponFormLayout
            formikProps={formikProps}
            onClose={onClose}
            formType="ADD"
          />
        </Form>
      )}
    </Formik>
  );
};

export default AddCouponFormWrapper;
