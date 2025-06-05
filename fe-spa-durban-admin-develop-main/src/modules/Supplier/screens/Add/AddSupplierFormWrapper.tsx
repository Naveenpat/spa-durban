import { Formik, FormikHelpers, Form } from 'formik';
import React from 'react';
import { SupplierFormValues } from '../../models/Supplier.model';
import SupplierFormLayout from '../../components/SupplierFormLayout';
import { object, string } from 'yup';
import { useNavigate } from 'react-router-dom';
import { useAddSupplierMutation } from '../../service/SupplierServices';
import { showToast } from 'src/utils/showToaster';

const AddSupplierFormWrapper = () => {
  const navigate = useNavigate();
  const [addSupplier] = useAddSupplierMutation();
  const initialValues: SupplierFormValues = {
    supplierName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    region: '',
    country: '',
    taxId: '',
  };

  const validationSchema = object().shape({
    supplierName: string().required('Please enter name'),
    phone: string().required('Please enter phone'),
    email: string().required('Please enter email'),
    address: string().required('Please enter address'),
    city: string().required('Please enter city'),
    region: string().required('Please enter region'),
    country: object().required('Please enter country'),
    taxId: string().required('Please enter tax no'),
  });

  const handleSubmit = (
    values: SupplierFormValues,
    { resetForm, setSubmitting }: FormikHelpers<SupplierFormValues>,
  ) => {
    let formattedValues = {
      ...values,
      country: values?.country?.label,
    };
    addSupplier(formattedValues).then((res: any) => {
      if (res?.error) {
        showToast('error', res?.error?.data?.message);
      } else {
        if (res?.data?.status) {
          showToast('success', res?.data?.message);
          resetForm();
          navigate('/supplier');
        } else {
          showToast('error', res?.data?.message);
        }
      }
      setSubmitting(false);
    });
  };

  return (
    <Formik<SupplierFormValues>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {(formikProps) => (
        <Form className="h-full">
          <SupplierFormLayout
            formikProps={formikProps}
            onCancel={() => navigate('/supplier')}
            formType="ADD"
          />
        </Form>
      )}
    </Formik>
  );
};

export default AddSupplierFormWrapper;
