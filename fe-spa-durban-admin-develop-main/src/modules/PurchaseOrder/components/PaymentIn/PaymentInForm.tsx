import { FormikProps } from 'formik';
import ATMCircularProgress from 'src/components/atoms/ATMCircularProgress/ATMCircularProgress';
import ATMNumberField from 'src/components/atoms/FormElements/ATMNumberField/ATMNumberField';
import MOLFormDialog from 'src/components/molecules/MOLFormDialog/MOLFormDialog';
import { PaymentInFormValues } from '../../models/PurchaseOrder.model';
import { CURRENCY } from 'src/utils/constants';

type Props = {
  formikProps: FormikProps<PaymentInFormValues>;
  onClose: () => void;
  dueAmount: number;
};

const PaymentInForm = ({ formikProps, onClose, dueAmount }: Props) => {
  const { values, setFieldValue, isSubmitting, handleBlur, touched, errors } =
    formikProps;
  const notGreaterThenDueAmount = (newValue: any) => {
    if (newValue === '') {
      return true;
    } else {
      return dueAmount >= Number(newValue);
    }
  };
  return (
    <MOLFormDialog
      title="Payment"
      onClose={onClose}
      isSubmitting={isSubmitting}
    >
      <div className="flex flex-col gap-4">
        <div className="text-xs font-semibold">
          Payable Amount : {CURRENCY} {dueAmount}
        </div>
        {/* Name */}
        <div className="">
          <ATMNumberField
            required
            name="paymentAmount"
            value={values.amount}
            onChange={(newValue) =>
              notGreaterThenDueAmount(newValue) &&
              setFieldValue('amount', newValue)
            }
            label="Amount"
            placeholder="Enter Amount"
            onBlur={handleBlur}
            isValid={!errors?.amount}
            isAllowDecimal
          />
        </div>
        <div className="p-4 text-xs font-semibold text-red-500 text-end">
          Amount Due : {CURRENCY}{' '}
          {dueAmount - Number(values?.amount || 0)}
        </div>
      </div>
    </MOLFormDialog>
  );
};

export default PaymentInForm;
