import { Formik, FormikHelpers, Form } from 'formik';
import React, { useState } from 'react';
import { EmployeeFormValues } from '../../models/Employee.model';
import EmployeeFormLayout from '../../components/EmployeeFormLayout';
import { array, mixed, number, object, string } from 'yup';
import { useNavigate } from 'react-router-dom';
import { useAddEmployeeMutation } from '../../service/EmployeeServices';
import { showToast } from 'src/utils/showToaster';

const AddEmployeeFormWrapper = () => {
  const navigate = useNavigate();
  const [addEmployee] = useAddEmployeeMutation();
   const [outletOrBranchOutlet, setOutletOrBranchOutlet] = useState('')
  const initialValues: EmployeeFormValues = {
    userName: '',
    email: '',
    password: '',
    userRoleId: '',
    name: '',
    outletsId: [],
    address: '',
    city: '',
    region: '',
    country: '',
    phone: '',
    companyId: null
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
    name: string().required('Please enter name'),
    address: string().required('Please enter address'),
    city: string().required('Please enter city'),
    region: string().required('Please enter region'),
    country: object().required('Please enter country'),
    phone: string().required('Please enter phone number'),

  })

  const handleSubmit = (
    values: EmployeeFormValues,
    { resetForm, setSubmitting }: FormikHelpers<EmployeeFormValues>,
  ) => {

 const formattedValues: any = {
  userName: values?.userName,
  email: values?.email,
  password: values?.password,
  userRoleId: values?.userRoleId?._id,
  name: values?.name,
  address: values?.address,
  city: values?.city,
  region: values?.region,
  country: values?.country?.label,
  phone: values?.phone,
};

// ✅ Conditionally add either companyId or outletsId based on state
if (outletOrBranchOutlet === 'company' && values.companyId) {
  formattedValues.companyId = values.companyId._id || values.companyId;
} else if (
  outletOrBranchOutlet === 'outlet' &&
  Array.isArray(values.outletsId) &&
  values.outletsId.length > 0
) {
  formattedValues.outletsId = values.outletsId.map((x) => x._id || x);
}


    

    // console.log('-----formattedValues', formattedValues)
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
            setOutletOrBranchOutlet={setOutletOrBranchOutlet}
            outletOrBranchOutlet={outletOrBranchOutlet}
          />
        </Form>
      )}
    </Formik>
  );
};

export default AddEmployeeFormWrapper;
