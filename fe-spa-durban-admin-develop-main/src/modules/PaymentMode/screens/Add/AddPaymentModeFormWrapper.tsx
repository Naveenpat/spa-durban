import { Formik, FormikHelpers, Form } from 'formik';
import React from 'react';
import { PaymentModeFormValues } from '../../models/PaymentMode.model';
import PaymentModeFormLayout from '../../components/PaymentModeFormLayout';
import { object, string } from 'yup';
import { useAddPayemntModeMutation } from '../../service/PaymentModeServices';
import { showToast } from 'src/utils/showToaster';

type Props = {
  onClose: () => void;
};

const AddPaymentModeFormWrapper = ({ onClose }: Props) => {
  const [addPaymenetMode] = useAddPayemntModeMutation()
  const initialValues: PaymentModeFormValues = {
    modeName: "",
    type: ""
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
    addPaymenetMode(formattedValues).then((res: any) => {
      if (res?.error) {
        showToast("error", res?.error?.data?.message);
      } else {
        if (res?.data?.status) {
          showToast("success", res?.data?.message);
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
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {(formikProps) => (
        <Form>
          <PaymentModeFormLayout
            formType="Add"
            formikProps={formikProps}
            onClose={onClose}
          />
        </Form>
      )}
    </Formik>
  );
};

export default AddPaymentModeFormWrapper;
