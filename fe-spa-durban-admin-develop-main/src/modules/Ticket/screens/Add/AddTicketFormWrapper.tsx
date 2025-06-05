import { Formik, FormikHelpers, Form } from 'formik';
import React from 'react';
import { TicketFormValues } from '../../models/Ticket.model';
import TicketFormLayout from '../../components/TicketFormLayout';
import { object, string } from 'yup';
import { useAddTicketMutation } from '../../service/TicketServices';
import { showToast } from 'src/utils/showToaster';

type Props = {
  onClose: () => void;
};

const AddTicketFormWrapper = ({ onClose }: Props) => {
  const [addTicket] = useAddTicketMutation();
  const initialValues: TicketFormValues = {
    outletId: '',
    ticketTitle: '',
    customerId: '',
    ticketType: '',
    description: '',
  };

  const validationSchema = object().shape({
    description: string().required('Please enter description'),
  });

  const handleSubmit = (
    values: TicketFormValues,
    { resetForm, setSubmitting }: FormikHelpers<TicketFormValues>,
  ) => {
    let formattedValues = {
      ...values,
      outletId: values?.outletId?._id,
      customerId: values?.customerId?._id,
      ticketType: values?.ticketType?.value,
    };
    addTicket(formattedValues).then((res: any) => {
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
    });
  };

  return (
    <Formik<TicketFormValues>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {(formikProps) => (
        <Form>
          <TicketFormLayout
            formikProps={formikProps}
            onClose={onClose}
            formType="ADD"
          />
        </Form>
      )}
    </Formik>
  );
};

export default AddTicketFormWrapper;
