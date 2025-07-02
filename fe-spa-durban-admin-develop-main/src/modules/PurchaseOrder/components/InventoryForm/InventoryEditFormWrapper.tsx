import { Formik, FormikHelpers, Form } from 'formik';
import React from 'react';
import { object } from 'yup';
import InventoryForm from './InventoryForm';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetPurchaseOrderbyIdQuery } from '../../service/PurchaseOrderServices';
import { useFetchData } from 'src/hooks/useFetchData';
import { PurchaseOrder } from '../../models/PurchaseOrder.model';
import { useAddInventoryMutation, useGetInventoryByPurchaseOrderIdQuery, useUpdateInventoryMutation } from 'src/modules/Inventory/service/InventoryServices';
import { showToast } from 'src/utils/showToaster';

const InventoryEditFormWrapper = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data, isLoading } = useFetchData(useGetPurchaseOrderbyIdQuery, {
    body: id,
    dataType: 'VIEW',
  });

  const { data: inventorydata } = useGetInventoryByPurchaseOrderIdQuery(id);

  console.log('-------', data)

  const [updateInventory] = useUpdateInventoryMutation();

  const purchaseOrderId = (data as any)?.data?._id;

  const initialValues = {
    products: (data as any)?.data?.products?.map((product: any) => {
      const inventories = inventorydata?.data
        ?.filter((inv: any) =>
          inv.POId === purchaseOrderId
        )
        ?.map((inv: any) => ({
          _id:inv._id,
          outlet: inv.outletId,
          quantity: inv.quantity,
        })) || [
          {
            outlet: '',
            quantity: 0,
          },
        ];

      return {
        product,
        inventories,
      };
    }),
  };


  console.log('----initialValues', initialValues)

  const validationSchema = object().shape({});

  const getFormattedData = (data: any[]) => {
    const result = data?.reduce((acc, el) => {
      el?.inventories?.forEach((inventory: any) => {
        acc?.push({
          inventoryId:inventory?._id,
          POId: id,
          productId: el?.product?.productId,
          purchasePrice: el?.product?.rate,
          quantity: inventory?.quantity,
          outletId: inventory?.outlet,
        });
      });
      return acc;
    }, []);
    return result;
  };
  const handleSubmit = (
    values: any,
    { resetForm, setSubmitting }: FormikHelpers<any>,
  ) => {

    console.log('--------values',values)
    updateInventory({ inventoryData: getFormattedData(values?.products) }).then(
      (res: any) => {
        if (res?.error) {
          showToast('error', res?.error?.data?.message);
        } else {
          if (res?.data?.status) {
            showToast('success', res?.data?.message);
            resetForm();
            navigate('/purchase-order');
          } else {
            showToast('error', res?.data?.message);
          }
        }
        setSubmitting(false);
      },
    );
  };

  return (
    <Formik<any>
      enableReinitialize
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {(formikProps) => (
        <Form>
          <InventoryForm
            formikProps={formikProps}
            onCancel={() => navigate('/purchase-order')}
            isLoading={isLoading}
            data={data}
            formType="EDIT"
          />
        </Form>
      )}
    </Formik>
  );
};

export default InventoryEditFormWrapper;
