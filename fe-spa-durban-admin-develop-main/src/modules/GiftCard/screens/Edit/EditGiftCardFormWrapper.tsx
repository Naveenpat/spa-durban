import { Formik, FormikHelpers, Form } from 'formik';
import React from 'react';
import { GiftCardFormValues } from '../../models/GiftCard.model';
import GiftCardFormLayout from '../../components/GiftCardFormLayout';
import { object, string } from 'yup';
import {
  useGetGiftCardQuery,
  useUpdateGiftCardMutation,
} from '../../service/GiftCardServices';
import { useFetchData } from 'src/hooks/useFetchData';
import { showToast } from 'src/utils/showToaster';

type Props = {
  onClose: () => void;
  giftCardId: string;
};

const EditGiftCardFormWrapper = ({ onClose, giftCardId }: Props) => {
  const [updateGiftCard] = useUpdateGiftCardMutation();
  const { data, isLoading } = useFetchData(useGetGiftCardQuery, {
    body: giftCardId,
    dataType: 'VIEW',
  });
  const initialValues: GiftCardFormValues = {
    giftCardName: (data as any)?.data?.giftCardName,
    giftCardAmount: (data as any)?.data?.giftCardAmount,
    giftCardExpiryDate: (data as any)?.data?.giftCardExpiryDate,
    customerId: { _id: (data as any)?.data?.customerId },
    type: (data as any)?.data?.type,
  };

  const validationSchema = object().shape({
    customerId: object().required('Please select customer name'),
    giftCardName: string().required('Please enter gift card name'),
    giftCardAmount: string().required('Please enter gift card amount'),
    giftCardExpiryDate: string().required('Please enter gift card expiry date'),
  });

  const handleSubmit = (
    values: GiftCardFormValues,
    { resetForm, setSubmitting }: FormikHelpers<GiftCardFormValues>,
  ) => {
    let formattedValues;

    if (values?.type === 'SPECIFIC_CUSTOMER') {
      formattedValues = {
        type: values?.type,
        customerId: values?.customerId?._id,
        giftCardAmount: values?.giftCardAmount,
        giftCardName: values?.giftCardName,
        giftCardExpiryDate: values?.giftCardExpiryDate,
      };
    } else {
      formattedValues = {
        type: values?.type,
        giftCardAmount: values?.giftCardAmount,
        giftCardName: values?.giftCardName,
        giftCardExpiryDate: values?.giftCardExpiryDate,
      };
    }
    updateGiftCard({ body: formattedValues, giftCardId }).then((res: any) => {
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
    });
  };

  return (
    <Formik<GiftCardFormValues>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
      enableReinitialize
    >
      {(formikProps) => (
        <Form>
          <GiftCardFormLayout
            formikProps={formikProps}
            onClose={onClose}
            isLoading={isLoading}
            formType="EDIT"
          />
        </Form>
      )}
    </Formik>
  );
};

export default EditGiftCardFormWrapper;
