import { Formik, FormikHelpers, Form } from 'formik';
import React from 'react';
import { PurchaseOrderFormValues } from '../../models/PurchaseOrder.model';
import PurchaseOrderFormLayout from '../../components/PurchaseOrderFormLayout';
import { array, object, string } from 'yup';
import { format } from 'date-fns';
import { showToast } from 'src/utils/showToaster';
import { useAddPurchaseOrderMutation } from '../../service/PurchaseOrderServices';

const AddPurchaseOrderFormWrapper = () => {
  const [addPurchaseOrder] = useAddPurchaseOrderMutation();

  const initialValues: PurchaseOrderFormValues = {
    supplier: '',
    orderDate: null,
    invoiceNumber: '',
    productDetails: [
      {
        product: '',
        rate: '',
        quantity: '',
        discount: '',
        discountType: 'PERCENT',
      },
    ],

    shippingCharges: '',
    amountPaid: '',
  };

  const validationSchema = object().shape({
    supplier: object().required('Please select supplier'),
    orderDate: string().required('Please select date'),
    invoiceNumber: string().required('Please enter invoice number'),
    productDetails: array().of(
      object().shape({
        product: object().required('Please select product'),
        rate: string().required('Enter rate'),
        quantity: string().required('Enter quantity'),
      }),
    ),
  });

  const handleSubmit = (
    values: PurchaseOrderFormValues,
    { resetForm, setSubmitting }: FormikHelpers<PurchaseOrderFormValues>,
  ) => {
    const formattedValues = {
      supplierId: values?.supplier?._id,
      invoiceNumber: values?.invoiceNumber,
      orderDate: format(new Date(values?.orderDate || ''), 'yyyy-MM-dd'),
      amountPaid: values?.amountPaid,
      shippingCharges: values?.shippingCharges || 0,
      products: values?.productDetails?.map((product) => ({
        productId: product?.product?._id,
        quantity: product?.quantity,
        rate: product?.rate,
        tax: product?.product?.taxId,
        discount: product?.discount || 0,
        discountType: product?.discountType,
      })),
    };

    addPurchaseOrder(formattedValues).then((res: any) => {
      if (res?.error) {
        showToast('error', res?.error?.data?.message);
      } else {
        if (res?.data?.status) {
          showToast('success', res?.data?.message);
          resetForm();
        } else {
          showToast('error', res?.data?.message);
        }
      }
      setSubmitting(false);
    });
  };

  return (
    <Formik<PurchaseOrderFormValues>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {(formikProps) => (
        <Form className="h-full ">
          <PurchaseOrderFormLayout formikProps={formikProps} />
        </Form>
      )}
    </Formik>
  );
};

export default AddPurchaseOrderFormWrapper;
