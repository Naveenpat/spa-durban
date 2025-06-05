import { Formik, FormikHelpers, Form } from "formik";
import React from "react";
import { AccountFormValues } from "../../models/Account.model";
import AccountFormLayout from "../../components/AccountFormLayout";
import { object, string } from "yup";
import { useGetAccountbyIdQuery, useUpdateAccountMutation } from "../../service/AccountServices";
import { useFetchData } from "src/hooks/useFetchData";
import { showToast } from "src/utils/showToaster";

type Props = {
    onClose: () => void;
    accountId: string;
};

const EditAccountFormWrapper = ({ onClose, accountId }: Props) => {
    const [updateAccount] = useUpdateAccountMutation()
    const { data, isLoading } = useFetchData(useGetAccountbyIdQuery, {
        body: accountId,
        dataType: 'VIEW',
    });
    const initialValues: AccountFormValues = {
        accountName: (data as any)?.data?.accountName || "",
        accountNumber: (data as any)?.data?.accountNumber || "",
        note: (data as any)?.data?.note || "",
    };

    const validationSchema = object().shape({
        accountName: string().required("Please enter account name"),
    });
    const handleSubmit = (
        values: AccountFormValues,
        { resetForm, setSubmitting }: FormikHelpers<AccountFormValues>
    ) => {
        const formattedValues = {
            accountName: values.accountName,
            accountNumber: values?.accountNumber,
            note: values?.note
        }
        updateAccount({ body: formattedValues, accountId }).then((res: any) => {
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
            enableReinitialize
            initialValues={initialValues}
            onSubmit={handleSubmit}
            validationSchema={validationSchema}
        >
            {(formikProps) => (
                <Form>
                    <AccountFormLayout formikProps={formikProps} onClose={onClose} formType="UPDATE" isLoading={isLoading} />
                </Form>
            )}
        </Formik>
    );
};

export default EditAccountFormWrapper;
