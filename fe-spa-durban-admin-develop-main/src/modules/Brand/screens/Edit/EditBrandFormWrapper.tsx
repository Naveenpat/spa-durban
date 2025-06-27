import { Formik, FormikHelpers, Form } from 'formik';
import React from 'react';
import { BrandFormValues } from '../../models/Brand.model';
import BrandFormLayout from '../../components/BrandFormLayout';
import { object, string } from 'yup';
import { useFetchData } from 'src/hooks/useFetchData';
import {
  useGetBrandByIdQuery,
  useUpdateBrandMutation,
} from '../../service/BrandServices';
import { showToast } from 'src/utils/showToaster';

type Props = {
  onClose: () => void;
  selectedBrandId: string;
};

const EditBrandFormWrapper = ({ onClose, selectedBrandId }: Props) => {
  const { data, isLoading } = useFetchData(useGetBrandByIdQuery, {
    body: selectedBrandId,
    dataType: 'VIEW',
  });

  const [updateBrand] = useUpdateBrandMutation();

  const initialValues: BrandFormValues = {
    brandName: (data as any)?.data?.brandName,
    description: (data as any)?.data?.description,
  };

  const validationSchema = object().shape({
    brandName: string().required('Please enter brand name'),
    description: string().required('Please enter description'),
  });

  const handleSubmit = (
    values: BrandFormValues,
    { resetForm, setSubmitting }: FormikHelpers<BrandFormValues>,
  ) => {
    updateBrand({ body: values, brandId: selectedBrandId }).then((res: any) => {
      if (res?.error) {
        showToast('error', res?.error?.data?.message);
      } else {
        if (res?.data?.status) {
          showToast('success', 'Brand updated successfully');
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
      enableReinitialize
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {(formikProps) => (
        <Form>
          <BrandFormLayout
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

export default EditBrandFormWrapper;
