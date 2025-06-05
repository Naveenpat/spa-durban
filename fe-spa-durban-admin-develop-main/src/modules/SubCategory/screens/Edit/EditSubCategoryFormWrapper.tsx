import { Formik, FormikHelpers, Form } from 'formik';
import React from 'react';
import { SubCategoryFormValues } from '../../models/SubCategory.model';
import SubCategoryFormLayout from '../../components/SubCategoryFormLayout';
import { object, string } from 'yup';
import {
  useGetSubCategoryByIdQuery,
  useUpdateSubCategoryMutation,
} from '../../service/SubCategoryServices';
import { showToast } from 'src/utils/showToaster';
import { useFetchData } from 'src/hooks/useFetchData';

type Props = {
  onClose: () => void;
  subCategoryId: string;
};

const EditSubCategoryFormWrapper = ({ onClose, subCategoryId }: Props) => {
  const [updateSubCategory] = useUpdateSubCategoryMutation();
  const { data, isLoading } = useFetchData(useGetSubCategoryByIdQuery, {
    body: subCategoryId,
    dataType: 'VIEW',
  });
  const initialValues: SubCategoryFormValues = {
    categoryName: { _id: (data as any)?.data?.categoryId },
    subCategoryName: (data as any)?.data?.subCategoryName,
    description: (data as any)?.data?.description,
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

    updateSubCategory({
      body: formattedValues,
      subCategoryId: subCategoryId,
    }).then((res: any) => {
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
    <Formik<SubCategoryFormValues>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
      enableReinitialize
    >
      {(formikProps) => (
        <Form>
          <SubCategoryFormLayout
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

export default EditSubCategoryFormWrapper;
