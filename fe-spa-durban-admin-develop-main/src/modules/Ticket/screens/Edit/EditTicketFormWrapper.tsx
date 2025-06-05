import { Formik, FormikHelpers, Form } from 'formik';
import React from 'react';
import { TicketFormValues } from '../../models/Ticket.model';
import TicketFormLayout from '../../components/TicketFormLayout';
import { object, string } from 'yup';
import {
  useAddTicketMutation,
  useGetTicketQuery,
  useUpdateTicketMutation,
} from '../../service/TicketServices';
import { showToast } from 'src/utils/showToaster';
import { useFetchData } from 'src/hooks/useFetchData';

type Props = {
  onClose: () => void;
  ticketId: string;
};

const EditTicketFormWrapper = ({ onClose, ticketId }: Props) => {
  const [updateTicket] = useUpdateTicketMutation();
  const { data, isLoading } = useFetchData(useGetTicketQuery, {
    body: ticketId,
    dataType: 'VIEW',
  });
  const initialValues: TicketFormValues = {
    outletId: { _id: (data as any)?.data?.outletId } || '',
    ticketTitle: (data as any)?.data?.ticketTitle || '',
    customerId: { _id: (data as any)?.data?.customerId } || '',
    ticketType: (data as any)?.data?.ticketType || '',
    description: (data as any)?.data?.ticketType || '',
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
    updateTicket({ body: formattedValues, ticketId: ticketId }).then(
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
    <Formik<TicketFormValues>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
      enableReinitialize
    >
      {(formikProps) => (
        <Form>
          <TicketFormLayout
            formikProps={formikProps}
            onClose={onClose}
            isLoading={isLoading}
            formType="EDIT"
          />
        </Form>
      )}
    </Formik>
  );
};

export default EditTicketFormWrapper;
