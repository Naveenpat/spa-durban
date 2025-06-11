import { Formik, FormikHelpers, Form } from 'formik';
import React from 'react';
import { OutletFormValues } from '../../models/Outlet.model';
import OutletFormLayout from '../../components/OutletFormLayout';
import { object, string } from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useGetOutletQuery,
  useUpdateOutletMutation,
} from '../../service/OutletServices';
import { useFetchData } from 'src/hooks/useFetchData';
import { showToast } from 'src/utils/showToaster';

const EditOutletFormWrapper = () => {
  const { id } = useParams();
  const [updateOutlet] = useUpdateOutletMutation();
  const { data, isLoading } = useFetchData(useGetOutletQuery, {
    body: id,
    dataType: 'VIEW',
  });
  const navigate = useNavigate();
  const initialValues: OutletFormValues = {
    name: (data as any)?.data?.name,
    phone: (data as any)?.data?.phone,
    email: (data as any)?.data?.email,
    address: (data as any)?.data?.address,
    city: (data as any)?.data?.city,
    region: (data as any)?.data?.region,
    country: { label: (data as any)?.data?.country },
    taxID: (data as any)?.data?.taxID,
    invoicePrefix: (data as any)?.data?.invoicePrefix,
    invoiceNumber: (data as any)?.data?.invoiceNumber,
    onlinePaymentAccountId: {
      _id: (data as any)?.data?.onlinePaymentAccountId,
    },
    logo:(data as any)?.data?.logo,
    companyId:(data as any)?.data?.companyId
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
    // onlinePaymentAccountId: object().required('Please select bank account'),
  });

  const handleSubmit = (
    values: OutletFormValues,
    { resetForm, setSubmitting }: FormikHelpers<OutletFormValues>,
  ) => {
    const { invoiceNumber, ...rest } = values;
    let formattedValues = {
      ...rest,
      country: rest?.country?.label,
      onlinePaymentAccountId: rest?.onlinePaymentAccountId?._id,
    };
    updateOutlet({ body: formattedValues, outletId: id }).then((res: any) => {
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
      enableReinitialize
    >
      {(formikProps) => (
        <Form className="h-full ">
          <OutletFormLayout
            formikProps={formikProps}
            oncancel={() => navigate('/outlets')}
            formType="EDIT"
            isLoading={isLoading}
          />
        </Form>
      )}
    </Formik>
  );
};

export default EditOutletFormWrapper;
