import { Formik, FormikHelpers, Form } from 'formik';
import React, { useEffect } from 'react';
import { OpenRegisterFormValues } from '../../models/OpenRegister.model';
import OpenRegisterFormLayout from '../../components/OpenRegisterFormLayout';
import { object, number } from 'yup';
import {
  useGetRegisterByIdQuery,
  useUpdateRegisterMutation,
} from '../../service/OpenRegisterServices';
import { showToast } from 'src/utils/showToaster';
import { useFetchData } from 'src/hooks/useFetchData';

type Props = {
  onClose: () => void;
  registerId: string;
};

const EditRegisterFormWrapper = ({ onClose, registerId }: Props) => {
  const [updateRegister] = useUpdateRegisterMutation();
  const { data, isLoading,refetch } = useFetchData(useGetRegisterByIdQuery, {
    body: registerId,
    dataType: 'VIEW',
  });

 
  // console.log('----',data)
  const initialValues: OpenRegisterFormValues = {
    registerId: (data as any)?.data?.registerId,
    openingBalance: (data as any)?.data?.openingBalance,
  };

  const validationSchema = object().shape({
    openingBalance: number()
      .required('Please enter opening balance')
      .min(0, 'Balance cannot be negative'),
    registerId: number().required('Please select a register'),
  });

  const handleSubmit = (
    values: OpenRegisterFormValues,
    { resetForm, setSubmitting }: FormikHelpers<OpenRegisterFormValues>,
  ) => {
    const formattedValues = {
      registerId: values?.registerId,
      openingBalance: values?.openingBalance,
    };
    updateRegister({ body: formattedValues, registerId: registerId }).then(
      (res: any) => {
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
      },
    );
  };

  return (
    <Formik<OpenRegisterFormValues>
      enableReinitialize
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {(formikProps) => (
        <Form>
          <OpenRegisterFormLayout
            formikProps={formikProps}
            onClose={onClose}
            formType="EDIT"
            isLoading={isLoading}
             openRegister={{}}
          />
        </Form>
      )}
    </Formik>
  );
};

export default EditRegisterFormWrapper;
