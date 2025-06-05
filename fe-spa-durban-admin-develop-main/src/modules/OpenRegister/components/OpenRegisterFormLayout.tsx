import { FormikProps } from 'formik';
import ATMTextField from 'src/components/atoms/FormElements/ATMTextField/ATMTextField';
import MOLFormDialog from 'src/components/molecules/MOLFormDialog/MOLFormDialog';
import { OpenRegisterFormValues } from '../models/OpenRegister.model';
import ATMNumberField from 'src/components/atoms/FormElements/ATMNumberField/ATMNumberField';
import ATMSelect from 'src/components/atoms/FormElements/ATMSelect/ATMSelect';
import ATMCircularProgress from 'src/components/atoms/ATMCircularProgress/ATMCircularProgress';

type Props = {
  formikProps: FormikProps<OpenRegisterFormValues>;
  onClose: () => void;
  formType: 'OPEN' | 'EDIT';
  isLoading?: boolean;
};

const registerOptions = [
  {
    label: 'Main Register',
    value: 'MAIN',
  },
  {
    label: 'Secondary Register',
    value: 'SECONDARY',
  },
];

const OpenRegisterFormLayout = ({
  formikProps,
  onClose,
  formType,
  isLoading = false,
}: Props) => {
  const { values, setFieldValue, isSubmitting, handleBlur, touched, errors } =
    formikProps;
  const formHeading = formType === 'OPEN' ? 'Open Register' : 'Edit Register';

  return (
    <MOLFormDialog
      title={formHeading}
      onClose={onClose}
      isSubmitting={isSubmitting}
    >
      {isLoading ? (
        <div className="flex justify-center items-center max-w-[500px] h-[140px]">
          <ATMCircularProgress />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {/* Register Selection */}
          {/* <div>
            <ATMSelect
              name="registerId"
              value={values.registerId}
              onChange={(newValue) => setFieldValue('registerId', newValue)}
              label="Register"
              options={registerOptions}
              valueAccessKey="value"
              placeholder="Please Select Register"
            />
          </div> */}

          {/* Opening Balance */}
          <div className="">
            <ATMNumberField
              required
              name="openingBalance"
              value={values.openingBalance}
              onChange={(newValue) => setFieldValue('openingBalance', newValue)}
              isAllowDecimal
              label="Float Cash Amount"
              placeholder="Enter float cash amount"
              onBlur={handleBlur}
              isTouched={touched?.openingBalance}
              errorMessage={errors?.openingBalance}
              isValid={!errors?.openingBalance}
            />
          </div>
        </div>
      )}
    </MOLFormDialog>
  );
};

export default OpenRegisterFormLayout;
