import { Formik, FormikHelpers, Form } from "formik";
import React from "react";
import { InvoicesFormValues } from "../../models/Invoices.model";
import InvoicesFormLayout from "../../components/InvoicesFormLayout";
import { object, string } from "yup";

type Props = {
  onClose: () => void;
};

const AddInvoicesFormWrapper = ({ onClose }: Props) => {
  const initialValues: InvoicesFormValues = {
    name: "",
  };

  const validationSchema = object().shape({
    name: string().required("Please enter name"),
  });

  const handleSubmit = (
    values: InvoicesFormValues,
    { resetForm, setSubmitting }: FormikHelpers<InvoicesFormValues>
  ) => {
    setTimeout(() => {
      console.log(values, "Submit values");
      setSubmitting(false);
      resetForm();
    }, 1000);
  };

  return (
    <Formik<InvoicesFormValues>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {(formikProps) => (
        <Form>
          <InvoicesFormLayout formikProps={formikProps} onClose={onClose} />
        </Form>
      )}
    </Formik>
  );
};

export default AddInvoicesFormWrapper;
