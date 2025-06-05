import { Formik, FormikHelpers, Form } from 'formik';
import React from 'react';
import { GiftCardFormValues } from '../../models/GiftCard.model';
import GiftCardFormLayout from '../../components/GiftCardFormLayout';
import { object, string } from 'yup';
import { useAddGiftCardMutation } from '../../service/GiftCardServices';
import { showToast } from 'src/utils/showToaster';

type Props = {
  onClose: () => void;
};

const AddGiftCardFormWrapper = ({ onClose }: Props) => {
  const [addGiftCard] = useAddGiftCardMutation();
  const initialValues: GiftCardFormValues = {
    giftCardName: '',
    giftCardAmount: '',
    giftCardExpiryDate: '',
    customerId: '',
    type: 'WHOEVER_BOUGHT',
  };

  const validationSchema = object().shape({
    customerId: object().test(
      'test-customerId',
      'Please select customer',
      (value, context) => {
        if (context?.parent?.type === 'SPECIFIC_CUSTOMER') {
          if (!value) {
            return false;
          } else {
            return true;
          }
        }
        return true;
      },
    ),
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
    addGiftCard(formattedValues).then((res: any) => {
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
    >
      {(formikProps) => (
        <Form>
          <GiftCardFormLayout
            formikProps={formikProps}
            onClose={onClose}
            formType="ADD"
          />
        </Form>
      )}
    </Formik>
  );
};

export default AddGiftCardFormWrapper;
