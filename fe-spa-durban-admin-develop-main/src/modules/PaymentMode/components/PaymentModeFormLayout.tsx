import { FormikProps } from 'formik';
import ATMTextField from 'src/components/atoms/FormElements/ATMTextField/ATMTextField';
import MOLFormDialog from 'src/components/molecules/MOLFormDialog/MOLFormDialog';
import { PaymentModeFormValues } from '../models/PaymentMode.model';
import ATMSelect from 'src/components/atoms/FormElements/ATMSelect/ATMSelect';
import ATMCircularProgress from 'src/components/atoms/ATMCircularProgress/ATMCircularProgress';

type Props = {
  formikProps: FormikProps<PaymentModeFormValues>;
  onClose: () => void;
  formType: 'Add' | 'Update';
  isLoading?: boolean;
};
const typeOption = [
  {
    label: 'Cash',
    value: 'cash',
  },
  {
    label: 'Referral',
    value: 'referral',
  },
  {
    label: 'Bank',
    value: 'bank',
  },
  {
    label: 'Credit Card',
    value: 'Credit Card',
  },
];

const PaymentModeFormLayout = ({
  formikProps,
  onClose,
  formType,
  isLoading = false,
}: Props) => {
  const { values, setFieldValue, isSubmitting, handleBlur, touched, errors } =
    formikProps;
  return (
    <MOLFormDialog
      title={`${formType} Payment Mode`}
      onClose={onClose}
      isSubmitting={isSubmitting}
    >
      {isLoading ? (
        <div className="flex justify-center items-center max-w-[500px] h-[140px]">
          <ATMCircularProgress />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="">
            {/* Type Name*/}
            <ATMSelect
              required
              name="type"
              value={values.type}
              onChange={(newValue) => setFieldValue('type', newValue)}
              label="Type"
              placeholder="Select Payment Mode Type"
              options={typeOption}
              valueAccessKey="value"
            />
          </div>
          {/* modeName */}
          <div className="">
            <ATMTextField
              required
              name="modeName"
              value={values?.modeName}
              onChange={(e) => setFieldValue('modeName', e.target.value)}
              label="Mode"
              placeholder="Enter Payment Mode"
              onBlur={handleBlur}
              isTouched={touched?.modeName}
              errorMessage={errors?.modeName}
              isValid={!errors?.modeName}
            />
          </div>
        </div>
      )}
    </MOLFormDialog>
  );
};

export default PaymentModeFormLayout;
