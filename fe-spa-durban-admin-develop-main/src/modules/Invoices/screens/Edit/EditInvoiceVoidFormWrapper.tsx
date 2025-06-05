import { Formik, FormikHelpers, Form } from 'formik';
import React from 'react';
import { Invoices, InvoicesFormValues } from '../../models/Invoices.model';
import InvoicesFormLayout from '../../components/InvoicesFormLayout';
import { object, string } from 'yup';
import {
  useGetInvoiceQuery,
  useUpdateInvoiceMutation,
} from '../../service/InvoicesServices';
import { useSearchParams } from 'react-router-dom';
import { showToast } from 'src/utils/showToaster';
import { useFetchData } from 'src/hooks/useFetchData';
import ATMCircularProgress from 'src/components/atoms/ATMCircularProgress/ATMCircularProgress';

type Props = {
  onClose: () => void;
  invoiceId: string;
};

const EditInvoiceVoidFormWrapper = ({ onClose, invoiceId }: Props) => {
  const [updateInvoice] = useUpdateInvoiceMutation();
  const { data, isLoading } = useFetchData(useGetInvoiceQuery, {
    body: invoiceId,
    dataType: 'VIEW',
  });

  const initialValues: InvoicesFormValues = {
    voidNote: (data as any)?.data?.voidNote,
  };

  const validationSchema = object().shape({
    voidNote: string().required('Please enter note'),
    // description: string(),
  });

  const handleSubmit = (
    values: InvoicesFormValues,
    { resetForm, setSubmitting }: FormikHelpers<InvoicesFormValues>,
  ) => {
    values.status = 'void';
    updateInvoice({ body: values, invoiceId }).then((res: any) => {
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
    <Formik<InvoicesFormValues>
      enableReinitialize
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {(formikProps) => (
        <Form>
          <InvoicesFormLayout
            formikProps={formikProps}
            onClose={onClose}
            // formType="EDIT"
            isLoading={isLoading}
          />
        </Form>
      )}
    </Formik>
  );
};

export default EditInvoiceVoidFormWrapper;
