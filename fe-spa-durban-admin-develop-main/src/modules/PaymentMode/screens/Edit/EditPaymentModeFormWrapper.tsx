import { Formik, FormikHelpers, Form } from 'formik';
import React from 'react';
import { PaymentModeFormValues } from '../../models/PaymentMode.model';
import PaymentModeFormLayout from '../../components/PaymentModeFormLayout';
import { object, string } from 'yup';
import { useGetPaymentModebyIdQuery, useUpdatePaymentModeMutation } from '../../service/PaymentModeServices';
import { useFetchData } from 'src/hooks/useFetchData';
import { showToast } from 'src/utils/showToaster';

type Props = {
  onClose: () => void;
  paymetModeId: string;
};
const EditPaymentModeFormWrapper = ({ onClose, paymetModeId }: Props) => {
  const [updatePaymentMode] = useUpdatePaymentModeMutation()
  const { data, isLoading } = useFetchData(useGetPaymentModebyIdQuery, {
    body: paymetModeId,
    dataType: 'VIEW',
  })

  const initialValues: PaymentModeFormValues = {
    type: { value: (data as any)?.type },
    modeName: (data as any)?.modeName
  };

  const validationSchema = object().shape({
    modeName: string().required("Please enter mode name"),
    type: object().required("Please select payment mode type"),
  });

  const handleSubmit = (
    values: PaymentModeFormValues,
    { resetForm, setSubmitting }: FormikHelpers<PaymentModeFormValues>,
  ) => {
    const formattedValues = {
      type: values?.type?.value,
      modeName: values?.modeName,
    }
    
    updatePaymentMode({ body: formattedValues, paymentModeId: paymetModeId }).then((res: any) => {
      if (res?.error) {
        showToast("error", res?.error?.data?.message);
      } else {
        if (res?.data?.status) {
          showToast("success", 'Payment mode updated Successfully');
          resetForm();
          onClose();
        } else {
          showToast("error", res?.data?.message);
        }
      }
      setSubmitting(false);
    });
  };

  return (
    <Formik<PaymentModeFormValues>
      enableReinitialize
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {(formikProps) => (
        <Form>
          <PaymentModeFormLayout
            formType="Update"
            formikProps={formikProps}
            onClose={onClose}
            isLoading={isLoading}
          />
        </Form>
      )}
    </Formik>
  );
};

export default EditPaymentModeFormWrapper;
