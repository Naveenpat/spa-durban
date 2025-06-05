import { FormikProps } from "formik";
import ATMTextField from "src/components/atoms/FormElements/ATMTextField/ATMTextField";
import MOLFormDialog from "src/components/molecules/MOLFormDialog/MOLFormDialog";
import { AccountFormValues } from "../models/Account.model";
import ATMTextArea from "src/components/atoms/FormElements/ATMTextArea/ATMTextArea";
import ATMCircularProgress from "src/components/atoms/ATMCircularProgress/ATMCircularProgress";

type Props = {
  formikProps: FormikProps<AccountFormValues>;
  onClose: () => void;
  formType: "ADD" | "UPDATE"
  isLoading?: boolean;
};

const AccountFormLayout = ({ formikProps, onClose, formType, isLoading = false }: Props) => {
  const { values, setFieldValue, isSubmitting, handleBlur, touched, errors } =
    formikProps;

  return (
    <MOLFormDialog
      title={formType === 'ADD' ? 'Add Account' : 'Update Account'}
      onClose={onClose}
      isSubmitting={isSubmitting}
    >
      {isLoading ? (
        <div className="flex justify-center items-center max-w-[500px] h-[275px]">
          <ATMCircularProgress />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Name */}
          <div className="">
            <ATMTextField
              name="accountName"
              value={values.accountName}
              onChange={(e) => setFieldValue("accountName", e.target.value)}
              label="Account Name"
              placeholder="Enter Account Name"
              onBlur={handleBlur}
              isTouched={touched?.accountName}
              errorMessage={errors?.accountName}
              isValid={!errors?.accountName}
              required
            />
          </div>
          <div className="">
            {/* Account No */}
            <ATMTextField
              name="accountNumber"
              value={values.accountNumber}
              onChange={(e) => setFieldValue("accountNumber", e.target.value)}
              label="Account Number"
              placeholder="Enter Account Number"
              onBlur={handleBlur}
              isValid={!errors?.accountNumber}
            />
          </div>
          {/* Note */}
          <div className="">
            <ATMTextArea
              name="note"
              value={values.note}
              onChange={(e) => setFieldValue("note", e.target.value)}
              label="Note"
              placeholder="Enter Note"
              onBlur={handleBlur}
              isTouched={touched?.note}
              errorMessage={errors?.note}
              isValid={!errors?.note}
            />
          </div>
        </div>)}
    </MOLFormDialog >
  );
};

export default AccountFormLayout;
