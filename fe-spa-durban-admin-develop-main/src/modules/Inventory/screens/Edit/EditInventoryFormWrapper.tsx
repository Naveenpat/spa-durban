import { Formik, FormikHelpers, Form } from 'formik';
import React from 'react';
import { InventoryFormValues } from '../../models/Inventory.model';
import InventoryFormLayout from '../../components/InventoryFormLayout';
import { object, string } from 'yup';

type Props = {
  onClose: () => void;
};

const EditInventoryFormWrapper = ({ onClose }: Props) => {
  const initialValues: InventoryFormValues = {
    product: '',
    purchasePrice: '',
    quantityValue: { abbr: 'kg' },
    dewasQty: '0',
    indoreQty: '0',
    bhopalQty: '0',
  };

  const validationSchema = object().shape({
    product: object().required('Please select product'),
    purchasePrice: string().required('Please enter purchase price'),
    dewasQty: string().test(
      'is-positive',
      'Quantity must be positive',
      (value) => {
        const numericValue = Number(value);
        return numericValue >= 0;
      },
    ),
    indoreQty: string().test(
      'is-positive',
      'Quantity must be positive',
      (value) => {
        const numericValue = Number(value);
        return numericValue >= 0;
      },
    ),
    bhopalQty: string().test(
      'is-positive',
      'Quantity must be positive',
      (value) => {
        const numericValue = Number(value);
        return numericValue >= 0;
      },
    ),
  });

  const handleSubmit = (
    values: InventoryFormValues,
    { resetForm, setSubmitting }: FormikHelpers<InventoryFormValues>,
  ) => {
    setTimeout(() => {
      console.log(values, 'Submit values');
      setSubmitting(false);
      resetForm();
    }, 1000);
  };

  return (
    <Formik<InventoryFormValues>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {(formikProps) => (
        <Form>
          <InventoryFormLayout
            formikProps={formikProps}
            onClose={onClose}
            formType="EDIT"
          />
        </Form>
      )}
    </Formik>
  );
};

export default EditInventoryFormWrapper;
