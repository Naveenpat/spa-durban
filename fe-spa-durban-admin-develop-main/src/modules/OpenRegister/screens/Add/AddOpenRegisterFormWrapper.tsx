import { Formik, FormikHelpers, Form } from 'formik';
import React from 'react';
import { OpenRegisterFormValues } from '../../models/OpenRegister.model';
import OpenRegisterFormLayout from '../../components/OpenRegisterFormLayout';
import { object, number, string } from 'yup';
import { useAddRegisterMutation } from '../../service/OpenRegisterServices';
import { showToast } from 'src/utils/showToaster';
import { RootState } from 'src/store';
import { useSelector } from 'react-redux';

type Props = {
  onClose: () => void;
};

const OpenRegisterFormWrapper = ({ onClose }: Props) => {
  const [openRegister] = useAddRegisterMutation();
  const { userData, outlet, outlets } = useSelector(
    (state: RootState) => state.auth,
  );
  const initialValues: OpenRegisterFormValues = {
    registerId: '', // Ensure validation accounts for this
    openingBalance: '',
  };

  const validationSchema = object().shape({
    openingBalance: number()
      .typeError('Opening balance must be a number')
      .required('Please enter opening balance')
      .min(0, 'Balance cannot be negative'),
    // registerId: string().required('Please select a register'),
  });

  const handleSubmit = async (
    values: OpenRegisterFormValues,
    { resetForm, setSubmitting }: FormikHelpers<OpenRegisterFormValues>,
  ) => {
    try {
      const formattedValues = {
        // registerId: values.registerId,
        openingBalance: Number(values.openingBalance), // Ensure number format
        outletId: outlet && (outlet as any)._id,
      };

      const res = await openRegister(formattedValues).unwrap(); // Proper async handling

      if (res?.status) {
        showToast('success', res.message);
        resetForm();
        onClose();
      } else {
        showToast('error', res?.message || 'Something went wrong');
      }
    } catch (error: any) {
      showToast('error', error?.data?.message || 'Failed to open register');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik<OpenRegisterFormValues>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {(formikProps) => (
        <Form>
          <OpenRegisterFormLayout
            formikProps={formikProps}
            onClose={onClose}
            formType="OPEN"
          />
        </Form>
      )}
    </Formik>
  );
};

export default OpenRegisterFormWrapper;
