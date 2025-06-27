import { Formik, FormikHelpers, Form } from 'formik';
import React from 'react';
import { BrandFormValues } from '../../models/Brand.model';
import BrandFormLayout from '../../components/BrandFormLayout';
import { object, string } from 'yup';
import { useAddBrandMutation } from '../../service/BrandServices';
import { showToast } from 'src/utils/showToaster';

type Props = {
  onClose: () => void;
};

const AddBrandFormWrapper = ({ onClose }: Props) => {
  const [addBrand] = useAddBrandMutation();

  const initialValues: BrandFormValues = {
    brandName: '',
    description: '',
  };

  const validationSchema = object().shape({
    brandName: string().required('Please enter brand name'),
    description: string().required('Please enter description'),
  });

  const handleSubmit = (
    values: BrandFormValues,
    { resetForm, setSubmitting }: FormikHelpers<BrandFormValues>,
  ) => {
    addBrand(values).then((res: any) => {
      if (res?.error) {
        showToast('error', res?.error?.data?.message);
      } else {
        if (res?.data?.status) {
          showToast('success', 'Brand added successfully');
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
    <Formik<BrandFormValues>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {(formikProps) => (
        <Form>
          <BrandFormLayout
            formikProps={formikProps}
            onClose={onClose}
            formType="ADD"
          />
        </Form>
      )}
    </Formik>
  );
};

export default AddBrandFormWrapper;
