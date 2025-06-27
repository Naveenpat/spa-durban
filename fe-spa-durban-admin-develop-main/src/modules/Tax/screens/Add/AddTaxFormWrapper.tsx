import { Formik, FormikHelpers, Form } from 'formik';
import React from 'react';
import { TaxFormValues } from '../../models/Tax.model';
import TaxFormLayout from '../../components/TaxFormLayout';
import { object, string } from 'yup';
import { useAddTaxMutation } from '../../service/TaxServices';
import { add } from 'date-fns';
import { showToast } from 'src/utils/showToaster';

type Props = {
  onClose: () => void;
};

const AddTaxFormWrapper = ({ onClose }: Props) => {
  const [addTax] = useAddTaxMutation()
  const initialValues: TaxFormValues = {
    taxType: '',
    taxPercent: '',
  };

  const validationSchema = object().shape({
    taxPercent: string().required('Please enter tax percent'),
    taxType: object().required('Please select tax type'),
  });

  const handleSubmit = (
    values: TaxFormValues,
    { resetForm, setSubmitting }: FormikHelpers<TaxFormValues>,
  ) => {
    const formattedValues = {
      taxType: values?.taxType?.value,
      taxPercent: values?.taxPercent
    }
    addTax(formattedValues).then((res: any) => {
      if (res?.error) {
        showToast("error", res?.error?.data?.message);
      } else {
        if (res?.data?.status) {
          showToast("success", 'Tax added successfully');
          resetForm();
          onClose();
        } else {
          showToast("error", res?.data?.message);
        }
      }
      setSubmitting(false);
    });
  };

  return (
    <Formik<TaxFormValues>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {(formikProps) => (
        <Form>
          <TaxFormLayout
            formikProps={formikProps}
            onClose={onClose}
            formType="ADD"
          />
        </Form>
      )}
    </Formik>
  );
};

export default AddTaxFormWrapper;
