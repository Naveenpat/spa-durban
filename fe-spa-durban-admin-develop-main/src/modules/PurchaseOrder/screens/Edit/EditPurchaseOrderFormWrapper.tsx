import { Formik, FormikHelpers, Form } from 'formik';
import React from 'react';
import { PurchaseOrderFormValues } from '../../models/PurchaseOrder.model';
import PurchaseOrderFormLayout from '../../components/PurchaseOrderFormLayout';
import { array, object, string } from 'yup';
import { format } from 'date-fns';
import { showToast } from 'src/utils/showToaster';
import { useAddPurchaseOrderMutation, useGetPurchaseOrderbyIdQuery, useUpdatePurchaseOrderMutation } from '../../service/PurchaseOrderServices';
import { useNavigate, useParams } from 'react-router-dom';
import { useFetchData } from 'src/hooks/useFetchData';

const EditPurchaseOrderFormWrapper = () => {
  const { id } = useParams();
  const [updatePurchaseOrder] = useUpdatePurchaseOrderMutation();
   const { data, isLoading } = useFetchData(useGetPurchaseOrderbyIdQuery, {
      body: id,
      dataType: 'VIEW',
    });

    console.log('----data',data)
  const navigate = useNavigate();
 const initialValues: PurchaseOrderFormValues = {
 supplier: {
    _id: (data as any)?.data?.supplierId || '',
    supplierName: (data as any)?.data?.supplierName || '',
    email: (data as any)?.data?.supplieremail || '',
    phone: (data as any)?.data?.supplierphone || '',
    address: (data as any)?.data?.supplieraddress || '',
  },
  orderDate: (data as any)?.data?.orderDate || '',
  invoiceNumber: (data as any)?.data?.invoiceNumber || '',
  productDetails:
  (data as any)?.data?.products?.map((prod: any) => ({
    product: {
      _id: prod?.productId?._id || prod?.productId,
      productName: prod?.productId?.productName || '',
      taxPercent: prod?.taxPercent || prod?.taxPercent || 0,
      taxType: prod?.taxType || prod?.taxType || 'PERCENT',
      tax: prod?.productId?.taxId || '',
      purchasePrice: prod?.rate || '',
    },
    rate: prod.rate || '',
    quantity: prod.quantity || '',
    discount: prod.discount || '',
    discountType: prod.discountType || 'PERCENT',
    taxPercent: prod.taxPercent || prod?.taxPercent || 0,
    taxType: prod.taxType || prod?.taxType || '',
  })) || [ /* fallback array */ ],

  shippingCharges: (data as any)?.data?.shippingCharges || '',
  amountPaid: (data as any)?.data?.amountPaid || '',
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

    updatePurchaseOrder({purchaseOrderId:id,body:formattedValues}).then((res: any) => {
      if (res?.error) {
        showToast('error', res?.error?.data?.message);
      } else {
        if (res?.data?.status) {
          showToast('success', res?.data?.message);
          navigate('/purchase-order')
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
      enableReinitialize
    >
      {(formikProps) => (
        <Form className="h-full ">
          <PurchaseOrderFormLayout formikProps={formikProps} oncancel={() => navigate('/purchase-order')}
            formType="EDIT"
            isLoading={isLoading}/>
        </Form>
      )}
    </Formik>
  );
};

export default EditPurchaseOrderFormWrapper;
