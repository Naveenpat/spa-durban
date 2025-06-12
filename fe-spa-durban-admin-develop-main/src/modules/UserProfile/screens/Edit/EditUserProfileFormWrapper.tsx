import { Formik, FormikHelpers, Form } from 'formik';
import React from 'react';
import { object, string } from 'yup';
import { UserProfileFormValues } from '../../models/UserProfile.model';
import EditUserProfileForm from '../../components/EditUserProfileForm';

const EditUserProfileFormWrapper = () => {
  const initialValues: UserProfileFormValues = {
    name: '',
    email: '',
    mobile: '',
    altMobile: '',
    language: '',
    city: '',
    postBox: '',
    country: '',
    address: '',
    signatureUrl: '',
    photoUrl: '',
  };

  const validationSchema = object().shape({
    name: string().required('Please enter name'),
    email: string().email().required('Please enter email'),
    mobile: string().required('Please enter mobile'),
    // altMobile: string().required('Please enter alternate mobile'),
    // language: string().required('Please enter language'),
    city: string().required('Please enter city'),
    // postBox: string().required('Please enter postBox'),
    country: string().required('Please enter country'),
    address: string().required('Please enter address'),
    signatureUrl: string().required('Please enter signature'),
    photoUrl: string().required('Please enter photo'),
  });

  const handleSubmit = (
    values: UserProfileFormValues,
    { resetForm, setSubmitting }: FormikHelpers<UserProfileFormValues>,
  ) => {
    setTimeout(() => {
      // console.log(values, 'Submit values');
      setSubmitting(false);
      resetForm();
    }, 1000);
  };

  return (
    <Formik<UserProfileFormValues>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {(formikProps) => (
        <Form>
          <EditUserProfileForm formikProps={formikProps} />
        </Form>
      )}
    </Formik>
  );
};

export default EditUserProfileFormWrapper;
