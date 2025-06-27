import { FormikProps } from 'formik';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from 'src/store';
import { showToast } from 'src/utils/showToaster';
import {
  useAddDraftMutation,
  usePreviewInvoiceMutation,
} from '../service/POSServices';
import { calculatedAmounts } from './CartSummarySection';
import PaymentFormLayout from './PaymentFormLayout';
import { setPreviewData } from '../slice/CartSlice';
type Props = {
  onClose: () => void;
  items: any;
  customerId: any;
  formikProps: FormikProps<any>;
};

const PaymentFormWrapper = ({
  onClose,
  items,
  customerId,
  formikProps,
}: Props) => {
  const { outlet } = useSelector((state: RootState) => state.auth);
  const [addDraft, { isLoading: isDraftSubmitting }] = useAddDraftMutation();
  const [previewInvoice, { isLoading: previewIsLoading }] =
    usePreviewInvoiceMutation();
  const { previewData } = useSelector((state: RootState) => state.cart);
  const payAbleAmount = Number(calculatedAmounts(items)?.totalAmount);
  const loyaltyPoints = customerId?.loyaltyPoints;
  const cashBackAmount = customerId?.cashBackAmount;
  const dispatch = useDispatch<AppDispatch>();
  const [isPreviewed, setIsPreviewed] = useState(false);
  const handleApplyPayment = (values: any, setFieldValue: any) => {
    let formattedValues = {
      customerId: customerId?._id,
      items: items?.map((item: any) => {
        return {
          itemId: item?._id,
          quantity: item?.quantity,
          itemType: item?.type,
        };
      }),
      couponCode: values?.couponCode || '',
      shippingCharges: values?.shippingCharges || 0,
      giftCardCode: values?.giftCardCode || '',
      promotionCoupanCode: values?.promotionCoupanCode || '',
      rewardCoupan: values?.rewardCoupan || '',
      useLoyaltyPoints: values?.useLoyaltyPoints,
      useCashBackAmount: values?.useCashBackAmount,
      usedCashBackAmount: values?.usedCashBackAmount,
      referralCode: '',
      outletId: (outlet as any)?._id,
    };
    previewInvoice(formattedValues).then((res: any) => {
      if (res?.error) {
        showToast('error', res?.error?.data?.message);
      } else {
        if (res?.data?.status) {
          // showToast('success', res?.data?.message);
          dispatch(setPreviewData(res?.data?.data));
          setIsPreviewed(true);
          setFieldValue(
            'amountReceived.0.amount',
            res?.data?.data?.invoiceData?.totalAmount?.toFixed(2),
          );
        } else {
          // showToast('error', res?.data?.message);
        }
      }
    });
  };

  const handleDraftdone = (formikProps: FormikProps<any>) => {
    formikProps.setFieldValue('items', []);
  };

  const handleDraft = (values: any) => {
    let formattedValues = {
      customerId: customerId?._id,
      items: items?.map((item: any) => {
        return {
          itemId: item?._id,
          quantity: item?.quantity,
          itemType: item?.type,
        };
      }),
      couponCode: values?.couponCode,
      shippingCharges: values?.shippingCharges || 0,
      amountReceived: [],
      giftCardCode: '',
      promotionCoupanCode: '',
      rewardCoupan: '',
      useLoyaltyPoints: values?.useLoyaltyPoints,
      referralCode: '',
      outletId: (outlet as any)?._id,
    };
    addDraft(formattedValues).then((res: any) => {
      if (res?.error) {
        showToast('error', res?.error?.data?.message);
      } else {
        if (res?.data?.status) {
          showToast('success', res?.data?.message);
          onClose();
          handleDraftdone(formikProps);
        } else {
          showToast('error', res?.data?.message);
        }
      }
    });
  };
  // console.log('payAbleAmount', payAbleAmount);

  return (
    <PaymentFormLayout
      previewData={previewData}
      handleApplyPayment={handleApplyPayment}
      onDraft={handleDraft}
      formikProps={formikProps}
      onClose={onClose}
      payAbleAmount={payAbleAmount}
      isPreviewed={isPreviewed}
      onModify={() => {
        setIsPreviewed(false), dispatch(setPreviewData(''));
      }}
      previewIsLoading={previewIsLoading}
      loyaltyPoints={loyaltyPoints}
      isDraftSubmitting={isDraftSubmitting}
      cashBackAmount={cashBackAmount}
    />
  );
};

export default PaymentFormWrapper;
