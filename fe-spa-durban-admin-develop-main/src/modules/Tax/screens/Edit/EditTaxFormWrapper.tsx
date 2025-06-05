import { Formik, FormikHelpers, Form } from 'formik';
import React from 'react';
import { TaxFormValues } from '../../models/Tax.model';
import TaxFormLayout from '../../components/TaxFormLayout';
import { object, string } from 'yup';
import {
  useGetTaxbyIdQuery,
  useUpdateTaxMutation,
} from '../../service/TaxServices';
import { showToast } from 'src/utils/showToaster';
import { useFetchData } from 'src/hooks/useFetchData';

type Props = {
  onClose: () => void;
  taxId: string;
};

const EditTaxFormWrapper = ({ onClose, taxId }: Props) => {
  const [updateTax] = useUpdateTaxMutation();
  const { data, isLoading } = useFetchData(useGetTaxbyIdQuery, {
    body: taxId,
    dataType: 'VIEW',
  });
  const initialValues: TaxFormValues = {
    taxType: { value: (data as any)?.data?.taxType },
    taxPercent: (data as any)?.data?.taxPercent,
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
      taxPercent: values?.taxPercent,
    };
    updateTax({ body: formattedValues, taxId: taxId }).then((res: any) => {
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
    <Formik<TaxFormValues>
      enableReinitialize
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {(formikProps) => (
        <Form>
          <TaxFormLayout
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

export default EditTaxFormWrapper;
