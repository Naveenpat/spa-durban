import { Formik, FormikHelpers, Form } from 'formik';
import React from 'react';
import { CustomerFormValues } from '../../models/Customer.model';
import CustomerFormLayout from '../../components/CustomerFormLayout';
import { date, object, string } from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useGetCustomerQuery,
  useUpdateCustomerMutation,
} from '../../service/CustomerServices';
import { useFetchData } from 'src/hooks/useFetchData';
import { showToast } from 'src/utils/showToaster';

const EditCustomerFormWrapper = () => {
  const navigate = useNavigate();
  const { id: customerId } = useParams();
  const [updateCustomer] = useUpdateCustomerMutation();
  const { data, isLoading } = useFetchData(useGetCustomerQuery, {
    body: customerId,
    dataType: 'VIEW',
  });
  const initialValues: CustomerFormValues = {
    customerName: (data as any)?.data?.customerName,
    phone: (data as any)?.data?.phone,
    email: (data as any)?.data?.email,
    address: (data as any)?.data?.address,
    city: (data as any)?.data?.city,
    region: (data as any)?.data?.region,
    country: { label: (data as any)?.data?.country },
    taxNo: (data as any)?.data?.taxNo,
    dateOfBirth: (data as any)?.data?.dateOfBirth || null,
    gender: { value: (data as any)?.data?.gender },
    customerGroup: (data as any)?.data?.customerGroup || ''
  };

  const validationSchema = object().shape({
    customerName: string().required('Please enter name'),
    phone: string()
      .required('Please enter phone number')
      .matches(/^[0-9]+$/, 'Phone number is not valid'),
    email: string().required('Please enter email address'),
    // dateOfBirth: date().required('Please select DOB').nullable(),
    // gender: object().required('Please select gender'),
  });

  const handleSubmit = (
    values: CustomerFormValues,
    { resetForm, setSubmitting }: FormikHelpers<CustomerFormValues>,
  ) => {
    let formattedValues = {
      ...values,
      gender: values?.gender?.value,
      customerGroup: values?.customerGroup?.value,
      country: values?.country?.label,
    };

  
    updateCustomer({ body: formattedValues, customerId }).then((res: any) => {
      if (res?.error) {
        showToast('error', res?.error?.data?.message);
      } else {
        if (res?.data?.status) {
          showToast('success', res?.data?.message);
          resetForm();
          navigate('/customer');
        } else {
          showToast('error', res?.data?.message);
        }
      }
      setSubmitting(false);
    });
  };

  return (
    <Formik<CustomerFormValues>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
      enableReinitialize
    >
      {(formikProps) => (
        <Form className="h-full">
          <CustomerFormLayout
            formikProps={formikProps}
            onCancel={() => navigate('/customer')}
            formType="EDIT"
            isLoading={isLoading}
          />
        </Form>
      )}
    </Formik>
  );
};

export default EditCustomerFormWrapper;
