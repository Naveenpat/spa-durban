import { Formik, FormikHelpers, Form } from 'formik';
import React from 'react';
import { CustomerFormValues } from '../../models/Customer.model';
import CustomerFormLayout from '../../components/CustomerFormLayout';
import { date, object, string } from 'yup';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAddCustomerMutation } from '../../service/CustomerServices';
import { showToast } from 'src/utils/showToaster';

const AddCustomerFormWrapper = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [addCustomer] = useAddCustomerMutation();
  const initialValues: CustomerFormValues = {
    customerName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    region: '',
    country: '',
    taxNo: '',
    dateOfBirth: null,
    gender: '',
    // customerGroup: ''
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

  const returnPath = location.state?.from || '/customer';

  const handleSubmit = (
    values: CustomerFormValues,
    { resetForm, setSubmitting }: FormikHelpers<CustomerFormValues>,
  ) => {
    let formattedValues = {
      ...values,
      gender: values?.gender?.value,
      // customerGroup:values?.customerGroup?.value,
      country: values?.country?.label,
    };

    addCustomer(formattedValues).then((res: any) => {
      if (res?.error) {
        showToast('error', res?.error?.data?.message);
      } else {
        if (res?.data?.status) {
          showToast('success', res?.data?.message);
          resetForm();
          navigate(`${returnPath}`);
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
    >
      {(formikProps) => (
        <Form>
          <CustomerFormLayout
            formikProps={formikProps}
            onCancel={() => navigate('/customer')}
            formType="ADD"
          />
        </Form>
      )}
    </Formik>
  );
};

export default AddCustomerFormWrapper;
