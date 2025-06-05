import { Form, Formik, FormikHelpers } from 'formik';
import { number, object, string } from 'yup';
import { PaymentInFormValues } from '../../models/PurchaseOrder.model';
import PaymentInForm from './PaymentInForm';
import { useUpdatePoPaymentMutation } from '../../service/PurchaseOrderServices';
import { showToast } from 'src/utils/showToaster';

type Props = {
  onClose: () => void;
  paymentInData: any;
};

const PaymentInFormWrapper = ({ onClose, paymentInData }: Props) => {
  const [updatePoPayment] = useUpdatePoPaymentMutation();
  const dueAmount =
    paymentInData?.payableAmount +
    paymentInData?.shippingCharges +
    paymentInData?.totalTax -
    paymentInData?.totalDiscount -
    paymentInData?.amountPaid;

  const initialValues: PaymentInFormValues = {
    amount: `${dueAmount}`,
  };
  const validationSchema = object().shape({
    amount: string()
      .test(
        'is-amount',
        'Amount paid can not greater than due amount',
        (value) => {
          return dueAmount >= Number(value);
        },
      )
      .required('Please enter amount'),
  });

  const handleSubmit = (
    values: any,
    { resetForm, setSubmitting }: FormikHelpers<PaymentInFormValues>,
  ) => {
    updatePoPayment({ body: values, purchaseOrderId: paymentInData?._id }).then(
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
    <Formik<PaymentInFormValues>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {(formikProps) => (
        <Form>
          <PaymentInForm
            formikProps={formikProps}
            onClose={onClose}
            dueAmount={dueAmount}
          />
        </Form>
      )}
    </Formik>
  );
};

export default PaymentInFormWrapper;
