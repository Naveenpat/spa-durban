import { Formik, FormikHelpers, Form } from 'formik';
import React from 'react';
import { object, string, ref } from 'yup';
import { ChangePasswordFormValues } from '../models/UserProfile.model';
import ChangePasswordFormLayout from './ChangePasswordFormLayout';
import { useChangePasswordMutation } from 'src/services/AuthServices';
import { showToast } from 'src/utils/showToaster';

type Props = {
  onClose: () => void;
};

const ChangePasswordFormLayoutWrapper = ({ onClose }: Props) => {
  const [chnagePassword] = useChangePasswordMutation();
  const initialValues: ChangePasswordFormValues = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  const validationSchema = object().shape({
    currentPassword: string().required('Please enter current Password'),
    newPassword: string().required('Please enter new Password'),
    confirmPassword: string()
      .required('Please enter confirm your password')
      .oneOf(
        [ref('newPassword')],
        'Confirm password must be same as New Password.',
      ),
  });

  const handleSubmit = (
    values: ChangePasswordFormValues,
    { resetForm, setSubmitting }: FormikHelpers<ChangePasswordFormValues>,
  ) => {
    chnagePassword(values).then((res: any) => {
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
    <Formik<ChangePasswordFormValues>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {(formikProps) => (
        <Form>
          <ChangePasswordFormLayout
            formikProps={formikProps}
            onClose={onClose}
          />
        </Form>
      )}
    </Formik>
  );
};

export default ChangePasswordFormLayoutWrapper;
