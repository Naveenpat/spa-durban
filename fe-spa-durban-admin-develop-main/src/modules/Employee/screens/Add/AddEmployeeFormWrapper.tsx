import { Formik, FormikHelpers, Form } from 'formik';
import React from 'react';
import { EmployeeFormValues } from '../../models/Employee.model';
import EmployeeFormLayout from '../../components/EmployeeFormLayout';
import { array, number, object, string } from 'yup';
import { useNavigate } from 'react-router-dom';
import { useAddEmployeeMutation } from '../../service/EmployeeServices';
import { showToast } from 'src/utils/showToaster';

const AddEmployeeFormWrapper = () => {
  const navigate = useNavigate();
  const [addEmployee] = useAddEmployeeMutation();
  const initialValues: EmployeeFormValues = {
    userName: '',
    email: '',
    password: '',
    userRoleId: '',
    name: '',
    outletsId: '',
    address: '',
    city: '',
    region: '',
    country: '',
    phone: '',
  };

  const userNameRegex = /^[a-z0-9]*$/;
  const passwordRegex = /^[a-zA-Z0-9@$!]*$/;

  const validationSchema = object().shape({
    userName: string()
      .matches(userNameRegex, {
        message: 'Only lowercase letters and numbers are allowed',
      })
      .required('Please enter user name'),
    email: string().required('Please enter email'),
    password: string()
      .matches(
        passwordRegex,
        'Password can only contain letters, numbers, @, and $',
      )
      .min(6, 'Password must be at least 6 characters')
      .max(20, 'Password must be at most 20 characters')
      .required('Please enter password'),
    userRoleId: object().required('Please select user role'),
    outletsId: array()
      .min(1, 'Please select outlets')
      .required('Please select outlets'),
    name: string().required('Please enter name'),
    address: string().required('Please enter address'),
    city: string().required('Please enter city'),
    region: string().required('Please enter region'),
    country: object().required('Please enter country'),
    phone: string().required('Please enter phone number'),
  });

  const handleSubmit = (
    values: EmployeeFormValues,
    { resetForm, setSubmitting }: FormikHelpers<EmployeeFormValues>,
  ) => {
    const formattedValues = {
      userName: values?.userName,
      email: values?.email,
      password: values?.password,
      userRoleId: values?.userRoleId?._id,
      outletsId: values?.outletsId?.map((outletsId: any) => outletsId?._id),
      name: values?.name,
      address: values?.address,
      city: values?.city,
      region: values?.region,
      country: values?.country?.label,
      phone: values?.phone,
    };
    addEmployee(formattedValues).then((res: any) => {
      if (res?.error) {
        showToast('error', res?.error?.data?.message);
      } else {
        if (res?.data?.status) {
          showToast('success', res?.data?.message);
          resetForm();
          navigate('/employee');
        } else {
          showToast('error', res?.data?.message);
        }
      }
      setSubmitting(false);
    });
  };

  return (
    <Formik<EmployeeFormValues>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {(formikProps) => (
        <Form>
          <EmployeeFormLayout
            formikProps={formikProps}
            onCancel={() => navigate('/employee')}
            formType="ADD"
          />
        </Form>
      )}
    </Formik>
  );
};

export default AddEmployeeFormWrapper;
