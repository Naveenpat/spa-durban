import { Formik, FormikHelpers, Form } from 'formik';
import React from 'react';
import { CategoryFormValues } from '../../models/Category.model';
import CategoryFormLayout from '../../components/CategoryFormLayout';
import { object, string } from 'yup';
import { showToast } from 'src/utils/showToaster';
import { useAddCategoryMutation } from '../../service/CategoryServices';

type Props = {
  onClose: () => void;
};

const AddCategoryFormWrapper = ({ onClose }: Props) => {
  const [addCategory] = useAddCategoryMutation();

  const initialValues: CategoryFormValues = {
    categoryName: '',
    description: '',
    colorCode: '',
  };

  const validationSchema = object().shape({
    categoryName: string().required('Please enter category name'),
    description: string(),
  });

  const handleSubmit = (
    values: CategoryFormValues,
    { resetForm, setSubmitting }: FormikHelpers<CategoryFormValues>,
  ) => {
    addCategory(values).then((res: any) => {
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
    <Formik<CategoryFormValues>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {(formikProps) => (
        <Form>
          <CategoryFormLayout
            formikProps={formikProps}
            onClose={onClose}
            formType="ADD"
          />
        </Form>
      )}
    </Formik>
  );
};

export default AddCategoryFormWrapper;
