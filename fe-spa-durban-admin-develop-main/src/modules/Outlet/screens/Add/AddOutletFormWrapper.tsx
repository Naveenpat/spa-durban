import { Formik, FormikHelpers, Form } from 'formik';
import React from 'react';
import { OutletFormValues } from '../../models/Outlet.model';
import OutletFormLayout from '../../components/OutletFormLayout';
import { object, string } from 'yup';
import { useNavigate } from 'react-router-dom';
import { useAddOutletMutation } from '../../service/OutletServices';
import { showToast } from 'src/utils/showToaster';

const AddOutletFormWrapper = () => {
  const navigate = useNavigate();
  const [addOutlet] = useAddOutletMutation();
  const initialValues: OutletFormValues = {
    name: '',
    address: '',
    city: '',
    region: '',
    country: '',
    phone: '',
    email: '',
    taxID: '',
    invoicePrefix: '',
    invoiceNumber: '',
    onlinePaymentAccountId: '',
  };

  const validationSchema = object().shape({
    name: string().required('Please enter name'),
    phone: string().required('Please enter phone number'),
    email: string()
      .required('Please enter your email')
      .matches(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please enter a valid email address with a supported domain',
      ),
    // address: string().required('Please enter address'),
    // city: string().required('Please enter city'),
    // region: string().required('Please enter region'),
    // country: object().required('Please enter country'),
    // taxID: string().required('Please enter tax id'),
    // invoicePrefix: string()
    //   .matches(/^[A-Z]+$/, 'Invoice prefix must contain only letters A-Z')
    //   .required('Please enter invoice prefix'),
    // invoiceNumber: string().required('Please enter invoice number'),
    // onlinePaymentAccountId: object().required('Please select bank account'),
  });

  const handleSubmit = (
    values: OutletFormValues,
    { resetForm, setSubmitting }: FormikHelpers<OutletFormValues>,
  ) => {
    let formattedValues = {
      ...values,
      country: values?.country?.label,
      onlinePaymentAccountId: values?.onlinePaymentAccountId?._id,
    };

    addOutlet(formattedValues).then((res: any) => {
      if (res?.error) {
        showToast('error', res?.error?.data?.message);
      } else {
        if (res?.data?.status) {
          showToast('success', res?.data?.message);
          resetForm();
          navigate('/outlets');
        } else {
          showToast('error', res?.data?.message);
        }
      }
      setSubmitting(false);
    });
  };

  return (
    <Formik<OutletFormValues>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {(formikProps) => (
        <Form>
          <OutletFormLayout
            formikProps={formikProps}
            oncancel={() => navigate('/outlets')}
            formType="ADD"
          />
        </Form>
      )}
    </Formik>
  );
};

export default AddOutletFormWrapper;
