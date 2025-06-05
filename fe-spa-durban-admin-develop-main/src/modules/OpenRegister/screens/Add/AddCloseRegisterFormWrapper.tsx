import { Formik, FormikHelpers, Form } from 'formik';
import React from 'react';
import { PaymentMode } from '../../models/OpenRegister.model';
// import OpenRegisterFormLayout from '../../components/OpenRegisterFormLayout';
import CloseRegisterFormLayout from '../../components/CloseRegisterFormLayout';
import { object, number, string } from 'yup';
import {
  useAddCloseRegisterMutation,
  useGetRegisterByCurrentDateQuery,
} from '../../service/OpenRegisterServices';
import { showToast } from 'src/utils/showToaster';
import { RootState } from 'src/store';
import { useSelector } from 'react-redux';
import { useFetchData } from 'src/hooks/useFetchData';

type Props = {
  onClose: () => void;
};

const AddCloseRegisterFormWrapper = ({ onClose }: Props) => {
  const [closeRegister] = useAddCloseRegisterMutation();

  const { userData, outlet, outlets } = useSelector(
    (state: RootState) => state.auth,
  );
  const { data, isLoading } = useFetchData(useGetRegisterByCurrentDateQuery, {
    body: outlet && (outlet as any)._id,
    dataType: 'VIEW',
  });

  // console.log('data========', data);

  const initialValues: PaymentMode = {
    _id: '',
    totalAmount: 0,
    paymentModeName: '',
    manual: {},
  };

  // const validationSchema = object().shape({
  //   openingBalance: number()
  //     .typeError('Opening balance must be a number')
  //     .required('Please enter opening balance')
  //     .min(0, 'Balance cannot be negative'),
  //   // registerId: string().required('Please select a register'),
  // });

  const handleSubmit = async (
    values: PaymentMode,
    { resetForm, setSubmitting }: FormikHelpers<PaymentMode>,
  ) => {
    try {
      const updatedPaymentModes = (data as any)?.data?.result?.map(
        (item: { _id: string | number }) => ({
          ...item,
          manual: values.manual[item._id] || '', // Add manual key, default empty string if not found
        }),
      );

      // console.log(updatedPaymentModes);
      const formattedValues = {
        closeRegister: updatedPaymentModes,
        outletId: outlet && (outlet as any)._id,
      };
      // console.log('formattedValues=======', formattedValues);

      const res = await closeRegister(formattedValues).unwrap(); // Proper async handling

      if (res?.status) {
        showToast('success', res.message);
        resetForm();
        onClose();
      } else {
        showToast('error', res?.message || 'Something went wrong');
      }
    } catch (error: any) {
      showToast('error', error?.data?.message || 'Failed to open register');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik<PaymentMode>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      // validationSchema={validationSchema}
    >
      {(formikProps) => (
        <Form>
          <CloseRegisterFormLayout
            formikProps={formikProps}
            onClose={onClose}
            formType="OPEN"
            opningData={(data as any)?.data}
            isLoading={isLoading}
          />
        </Form>
      )}
    </Formik>
  );
};

export default AddCloseRegisterFormWrapper;
