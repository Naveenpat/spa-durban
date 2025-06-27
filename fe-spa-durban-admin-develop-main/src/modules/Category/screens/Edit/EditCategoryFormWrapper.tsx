import { Formik, FormikHelpers, Form } from 'formik';
import React from 'react';
import { Category, CategoryFormValues } from '../../models/Category.model';
import CategoryFormLayout from '../../components/CategoryFormLayout';
import { object, string } from 'yup';
import {
  useGetCategoryByIdQuery,
  useUpdateCategoryMutation,
} from '../../service/CategoryServices';
import { useSearchParams } from 'react-router-dom';
import { showToast } from 'src/utils/showToaster';
import { useFetchData } from 'src/hooks/useFetchData';
import ATMCircularProgress from 'src/components/atoms/ATMCircularProgress/ATMCircularProgress';

type Props = {
  onClose: () => void;
  categoryId: string;
};

const EditCategoryFormWrapper = ({ onClose, categoryId }: Props) => {
  const [updateCategory] = useUpdateCategoryMutation();
  const { data, isLoading } = useFetchData(useGetCategoryByIdQuery, {
    body: categoryId,
    dataType: 'VIEW',
  });

  const initialValues: CategoryFormValues = {
    categoryName: (data as any)?.data?.categoryName,
    description: (data as any)?.data?.description,
    colorCode: (data as any)?.data?.colorCode,
  };

  const validationSchema = object().shape({
    categoryName: string().required('Please enter category name'),
    description: string(),
  });

  const handleSubmit = (
    values: CategoryFormValues,
    { resetForm, setSubmitting }: FormikHelpers<CategoryFormValues>,
  ) => {
    updateCategory({ body: values, categoryId }).then((res: any) => {
      if (res?.error) {
        showToast('error', res?.error?.data?.message);
      } else {
        if (res?.data?.status) {
          showToast('success', 'Category updated successfully');
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
      enableReinitialize
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {(formikProps) => (
        <Form>
          <CategoryFormLayout
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

export default EditCategoryFormWrapper;
