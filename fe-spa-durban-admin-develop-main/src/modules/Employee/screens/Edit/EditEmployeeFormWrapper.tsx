import { Formik, FormikHelpers, Form } from 'formik';
import React from 'react';
import { EmployeeFormValues } from '../../models/Employee.model';
import EmployeeFormLayout from '../../components/EmployeeFormLayout';
import { array, number, object, string } from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useGetEmployeeByIdQuery,
  useUpdateEmployeeMutation,
} from '../../service/EmployeeServices';
import { showToast } from 'src/utils/showToaster';
import { useFetchData } from 'src/hooks/useFetchData';
const EditEmployeeFormWrapper = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [updateEmployee] = useUpdateEmployeeMutation();
  const { data, isLoading } = useFetchData(useGetEmployeeByIdQuery, {
    body: id,
    dataType: 'VIEW',
  });
  const initialValues: EmployeeFormValues = {
    userName: (data as any)?.data?.userName,
    email: (data as any)?.data?.email,
    password: (data as any)?.data?.password,
    userRoleId: { _id: (data as any)?.data?.userRoleId },
    outletsId: (data as any)?.data?.outletsId?.map((el: string) => ({
      _id: el,
    })),
    name: (data as any)?.data?.name,
    address: (data as any)?.data?.address,
    city: (data as any)?.data?.city,
    region: (data as any)?.data?.region,
    country: { label: (data as any)?.data?.country },
    phone: (data as any)?.data?.phone,
  };

  const validationSchema = object().shape({
    userName: string()
      .matches(/^[a-z0-9@]+$/, 'Only lowercase letters and numbers are allowed')
      .required('Please enter user name'),
    email: string().required('Please enter email'),
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
    updateEmployee({ body: formattedValues, employeeId: id }).then(
      (res: any) => {
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
      },
    );
  };

  return (
    <Formik<EmployeeFormValues>
      enableReinitialize
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {(formikProps) => (
        <Form className="h-full">
          <EmployeeFormLayout
            formikProps={formikProps}
            onCancel={() => navigate('/employee')}
            formType="UPDATE"
            isLoading={isLoading}
          />
        </Form>
      )}
    </Formik>
  );
};

export default EditEmployeeFormWrapper;
