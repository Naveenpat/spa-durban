import { Formik, FormikHelpers, Form } from "formik";
import React from "react";
import { AccountFormValues } from "../../models/Account.model";
import AccountFormLayout from "../../components/AccountFormLayout";
import { object, string } from "yup";
import { useAddAccountMutation } from "../../service/AccountServices";
import { showToast } from "src/utils/showToaster";

type Props = {
  onClose: () => void;
};

const AddAccountFormWrapper = ({ onClose }: Props) => {
  const [addAccount] = useAddAccountMutation()
  const initialValues: AccountFormValues = {
    accountName: "",
    accountNumber: "",
    note: "",
  };

  const validationSchema = object().shape({
    accountName: string().required("Please enter account name"),
  });

  const handleSubmit = (
    values: AccountFormValues,
    { resetForm, setSubmitting }: FormikHelpers<AccountFormValues>
  ) => {
      addAccount(values).then((res: any) => {
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
    <Formik<AccountFormValues>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {(formikProps) => (
        <Form>
          <AccountFormLayout formikProps={formikProps} onClose={onClose} formType="ADD" />
        </Form>
      )}
    </Formik>
  );
};

export default AddAccountFormWrapper;
