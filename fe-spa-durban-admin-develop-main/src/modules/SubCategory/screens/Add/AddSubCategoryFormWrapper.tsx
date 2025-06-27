import { Formik, FormikHelpers, Form } from 'formik';
import React from 'react';
import { SubCategoryFormValues } from '../../models/SubCategory.model';
import SubCategoryFormLayout from '../../components/SubCategoryFormLayout';
import { object, string } from 'yup';
import { useAddSubCategoryMutation } from '../../service/SubCategoryServices';
import { showToast } from 'src/utils/showToaster';

type Props = {
  onClose: () => void;
};

const AddSubCategoryFormWrapper = ({ onClose }: Props) => {
  const [addSubCategory] = useAddSubCategoryMutation();
  const initialValues: SubCategoryFormValues = {
    categoryName: '',
    subCategoryName: '',
    description: '',
  };

  const validationSchema = object().shape({
    categoryName: object().required('Please select category name'),
    subCategoryName: string().required('Please enter sub category'),
    description: string().required('Please enter description'),
  });

  const handleSubmit = (
    values: SubCategoryFormValues,
    { resetForm, setSubmitting }: FormikHelpers<SubCategoryFormValues>,
  ) => {
    let formattedValues = {
      subCategoryName: values?.subCategoryName,
      description: values?.description,
      categoryId: values?.categoryName?._id,
    };

    addSubCategory(formattedValues).then((res: any) => {
      if (res?.error) {
        showToast('error', res?.error?.data?.message);
      } else {
        if (res?.data?.status) {
          showToast('success', 'Subcategory added successfully');
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
    <Formik<SubCategoryFormValues>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {(formikProps) => (
        <Form>
          <SubCategoryFormLayout
            formikProps={formikProps}
            onClose={onClose}
            formType="ADD"
          />
        </Form>
      )}
    </Formik>
  );
};

export default AddSubCategoryFormWrapper;
