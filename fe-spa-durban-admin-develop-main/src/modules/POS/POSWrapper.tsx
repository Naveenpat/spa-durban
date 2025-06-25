import { array, number, object } from 'yup';
import POS from './POS';
import { Form, Formik, FormikHelpers } from 'formik';
import { AppDispatch, RootState } from 'src/store';
import { useDispatch, useSelector } from 'react-redux';
import { showToast } from 'src/utils/showToaster';
import { setIsOpenAddDialog, setIsOpenCustomerDialog } from './slice/CartSlice';
import { useAddInvoiceMutation, useUpdateGivenChangeMutation } from './service/POSServices';
import AddCustomerFormWrapper from './components/AddCustomerForm/AddCustomerFormWrapper';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  setIsOpenAddDialog as setIsOpenAddDialogRegister,
  setIsCloseAddDialog,
} from 'src/modules/OpenRegister/slice/OpenRegisterSlice';
import OpenRegisterFormWrapper from '../OpenRegister/screens/Add/AddOpenRegisterFormWrapper';
import CloseRegisterFormWrapper from '../OpenRegister/screens/Add/AddCloseRegisterFormWrapper';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useSendPdfViaEmailMutation } from '../Invoices/service/InvoicesServices';
type Props = {};

const POSWrapper = (props: Props) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const bookingId = searchParams.get("bookingId")

  const { outlet } = useSelector((state: RootState) => state.auth);
  const { isOpenCustomerDialog, previewData } = useSelector(
    (state: RootState) => state.cart,
  );
  const { isOpenAddDialog, isCloseAddDialog } = useSelector(
    (state: RootState) => state?.register,
  );

  const dispatch = useDispatch<AppDispatch>();
  const [addInvoice] = useAddInvoiceMutation();
  const [updateGivenChange] = useUpdateGivenChangeMutation();

  const initialValues = {
    customer: null,
    items: [],
    couponCode: '',
    shippingCharges: 0,
    amountReceived: [
      {
        paymentModeId: '',
        amount: 0,
      },
    ],
    giftCardCode: '',
    promotionCoupanCode:'',
    rewardCoupan:'',
    useLoyaltyPoints: false,
    useCashBackAmount: false,
    usedCashBackAmount: 0,
    referralCode: '',
    notes: '',
  };
  // const validationSchema = object().shape({
  //   customer: object().required('Please select customer').nullable(),
  //   amountReceived: array().of(
  //     object().shape({
  //       paymentModeId: object().required('Payment mode is required'),
  //       amount: number()
  //         .required('Amount is required')
  //         .typeError('Amount must be a number')
  //         .min(0, 'Amount must be positive')
  //         .test('totalReceived', '', function (value, context) {
  //           const totalReceived =
  //             context?.options?.context?.amountReceived?.reduce(
  //               (sum: number, item: any) => sum + (Number(item.amount) || 0),
  //               0,
  //             );
  //           return (
  //             totalReceived <= previewData?.invoiceData?.totalAmount.toFixed(2)
  //           );
  //         }),
  //     }),
  //   ),
  // });
  const validationSchema = object().shape({
    customer: object().required('Please select customer').nullable(),
    amountReceived: array().of(
      object().shape({
        paymentModeId: object().required('Payment mode is required'),
        amount: number()
          .required('Amount is required')
          .typeError('Amount must be a number')
          .min(0, 'Amount must be positive'),
      }),
    ),
  });

  // const handleSubmit = (
  //   values: any,
  //   { resetForm, setSubmitting }: FormikHelpers<any>,
  // ) => {
  //   let formattedValues = {
  //     customerId: values?.customer?._id,
  //     items: values?.items?.map((item: any) => {
  //       return {
  //         itemId: item?._id,
  //         quantity: item?.quantity,
  //         itemType: item?.type,
  //       };
  //     }),
  //     couponCode: values?.couponCode,
  //     shippingCharges: values?.shippingCharges || 0,
  //     amountReceived: values?.amountReceived?.map((el: any) => {
  //       return {
  //         paymentModeId: el?.paymentModeId?._id,
  //         amount: el?.amount,
  //       };
  //     }),
  //     giftCardCode: values?.giftCardCode,
  //     useLoyaltyPoints: values?.useLoyaltyPoints,
  //     referralCode: '',
  //     outletId: (outlet as any)?._id,
  //     notes: values?.notes,
  //     useCashBackAmount: values?.useCashBackAmount,
  //     usedCashBackAmount: values?.usedCashBackAmount,
  //     bookingId: bookingId
  //   };
  //   addInvoice(formattedValues).then((res: any) => {
  //     if (res?.error) {
  //       showToast('error', res?.error?.data?.message);
  //     } else {
  //       if (res?.data?.status) {
  //         showToast('success', res?.data?.message);
  //         resetForm();
  //         dispatch(setIsOpenAddDialog(false));
  //         navigate(`/invoice/receipt/${res?.data?.data?._id}`);
  //       } else {
  //         showToast('error', res?.data?.message);
  //       }
  //     }
  //     setSubmitting(false);
  //   });
  // };

  // new code -----
  const [sendPdfViaEmail, { isLoading }] = useSendPdfViaEmailMutation();

  const handleSendEmail = async (invoiceId: any) => {
    // console.log('---- handle send email')
    const receiptElement = document.querySelector('.receipt-print');

    if (!receiptElement) return;

    try {
      const canvas = await html2canvas(receiptElement as HTMLElement, { scale: 2 });
      const imgData = canvas.toDataURL('image/png', 0.6);

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const padding = 10;
      const imgWidth = pageWidth - 2 * padding;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // First page
      pdf.addImage(imgData, 'PNG', padding, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 2 * padding;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight - 10 - padding;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', padding, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - 10 - padding;
      }

      // Create blob & formData
      const pdfBlob = pdf.output('blob');
      const formData = new FormData();
      formData.append('file', pdfBlob, 'invoice.pdf');
      formData.append('emailBody', 'Dear Customer,\n\nThank you for your purchase. Please find the attached invoice.\n\nBest regards,\nYour Company Name');

      // Send to backend
      const res = await sendPdfViaEmail({
        invoiceId, // ✅ Make sure this is a valid MongoDB ID
        body: formData,
      });

      if ('error' in res) {
        showToast('error', 'Failed to send email');
      } else {
        showToast('success', res.data?.message || 'Invoice emailed successfully');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Something went wrong while generating or sending the PDF');
    }
  };
  //------------------- end new code


  const handleSubmit = async (
    values: any,
    { resetForm, setSubmitting }: FormikHelpers<any>,
  ) => {
    let formattedValues = {
      customerId: values?.customer?._id,
      items: values?.items?.map((item: any) => ({
        itemId: item?._id,
        quantity: item?.quantity,
        itemType: item?.type,
      })),
      couponCode: values?.couponCode,
      shippingCharges: values?.shippingCharges || 0,
      amountReceived: values?.amountReceived?.map((el: any) => ({
        paymentModeId: el?.paymentModeId?._id,
        amount: el?.amount,
      })),
      giftCardCode: values?.giftCardCode,
      promotionCoupanCode: values?.promotionCoupanCode,
      rewardCoupan:values?.rewardCoupan,
      useLoyaltyPoints: values?.useLoyaltyPoints,
      referralCode: '',
      outletId: (outlet as any)?._id,
      notes: values?.notes,
      useCashBackAmount: values?.useCashBackAmount,
      usedCashBackAmount: values?.usedCashBackAmount,
      bookingId: bookingId,
    };

    setSubmitting(true);

    try {
      // console.log("4444444444444440000000000")
      const res: any = await addInvoice(formattedValues);

      if (res?.error) {
        showToast('error', res?.error?.data?.message);
      } else if (res?.data?.status) {
        
        const createdInvoiceId = res?.data?.data?._id;
       
        const totalAmount = previewData?.invoiceData?.totalAmount || 0;
        const totalReceived = values?.amountReceived?.reduce(
          (sum: number, item: any) => sum + (Number(item.amount) || 0),
          0,
        );

        const givenChange = totalReceived - totalAmount;

        // If givenChange is positive, call the update API
        if (givenChange > 0 && createdInvoiceId) {
          const givenChangePayload = {
            invoiceId: createdInvoiceId,
            value: givenChange,
          };
          // console.log("555555555540000000000")
          await updateGivenChange(givenChangePayload);
        }

        showToast('success', res?.data?.message);
        resetForm();
        dispatch(setIsOpenAddDialog(false));
        navigate(`/invoice/receipt/${createdInvoiceId}`);
        //--------
        // Then after rendering
        setTimeout(() => {
          handleSendEmail(createdInvoiceId);
        }, 1000); // Wait to ensure DOM is ready
        //--------
      } else {
        showToast('error', res?.data?.message);
      }
    } catch (error) {
      console.error("Submit Error:", error);
      showToast('error', 'Something went wrong while submitting the invoice.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validationSchema={validationSchema}
        enableReinitialize
      >
        {(formikProps) => (
          <Form>
            <POS formikProps={formikProps} />
          </Form>
        )}
      </Formik>

      {isOpenCustomerDialog && (
        <AddCustomerFormWrapper
          onClose={() => dispatch(setIsOpenCustomerDialog(false))}
        />
      )}

      {isOpenAddDialog && (
        <OpenRegisterFormWrapper
          onClose={() => dispatch(setIsOpenAddDialogRegister(false))}
          opningData={null}
        />
      )}
      {isCloseAddDialog && (
        <CloseRegisterFormWrapper
          onClose={() => dispatch(setIsCloseAddDialog(false))}
        />
      )}
    </div>
  );
};

export default POSWrapper;
