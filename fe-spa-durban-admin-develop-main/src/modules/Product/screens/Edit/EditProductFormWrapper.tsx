import { Formik, FormikHelpers, Form } from 'formik';
import React from 'react';
import ProductFormLayout from '../../components/ProductFormLayout';
import { object, string } from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useGetProductQuery,
  useUpdateProductMutation,
} from '../../service/ProductServices';
import { showToast } from 'src/utils/showToaster';
import { useFetchData } from 'src/hooks/useFetchData';

const EditProductFormWrapper = () => {
  const navigate = useNavigate();
  const { id: productId } = useParams();
  const [updateProduct] = useUpdateProductMutation();
  const { data, isLoading } = useFetchData(useGetProductQuery, {
    body: productId,
    dataType: 'VIEW',
  });
  const initialValues: ProductFormValues = {
    productName: (data as any)?.data?.productName,
    productCode: (data as any)?.data?.productCode,
    categoryId: { _id: (data as any)?.data?.categoryId },
    subCategoryId: { _id: (data as any)?.data?.subCategoryId },
    brandId: { _id: (data as any)?.data?.brandId },
    productImageUrl: (data as any)?.data?.productImageUrl,
    description: (data as any)?.data?.description,
    measurementUnitId: { _id: (data as any)?.data?.measurementUnitId },
    barcode: (data as any)?.data?.barcode,
    mrp: (data as any)?.data?.mrp,
    sellingPrice: (data as any)?.data?.sellingPrice,
    purchasePrice: (data as any)?.data?.purchasePrice,
    tax: { _id: (data as any)?.data?.taxId },
  };
  const validationSchema = object().shape({
    productName: string().required('Please enter product name'),
    // categoryId: object().required('Please select category'),
    // subCategoryId: object().required('Please select sub category').nullable(),
    // brandId: object().required('Please select brand'),
    // productCode: string().required('Please enter product code'),
    // measurementUnitId: object().required('Please select measurement unit'),
    // purchasePrice: string().required('Please enter purchase  price'),
    // mrp: string().required('Please enter product MRP'),
    // sellingPrice: string().required('Please enter product selling price'),
    // barcode: string().required('Please enter barcode'),
    // description: string().required('Please enter description'),
  });

  const handleSubmit = (
    values: ProductFormValues,
    { resetForm, setSubmitting }: FormikHelpers<ProductFormValues>,
  ) => {
    let formattedValues = {
      productName: values?.productName,
      productCode: values?.productCode,
      productImageUrl: values?.productImageUrl,
      description: values?.description,
      barcode: values?.barcode,
      mrp: values?.mrp,
      sellingPrice: values?.sellingPrice,
      purchasePrice: values?.purchasePrice,
      measurementUnitId: values?.measurementUnitId?._id,
      brandId: values?.brandId?._id,
      subCategoryId: values?.subCategoryId?._id,
      taxId: values?.tax?._id,
    };
    updateProduct({ body: formattedValues, productId: productId }).then(
      (res: any) => {
        if (res?.error) {
          showToast('error', res?.error?.data?.message);
        } else {
          if (res?.data?.status) {
            showToast('success', res?.data?.message);
            navigate('/product');
          } else {
            showToast('error', res?.data?.message);
          }
        }
        setSubmitting(false);
      },
    );
  };

  return (
    <Formik<ProductFormValues>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
      enableReinitialize
    >
      {(formikProps) => (
        <Form className="h-full">
          <ProductFormLayout
            formikProps={formikProps}
            onCancel={() => {
              navigate('/product');
            }}
            formType="EDIT"
            isLoading={isLoading}
          />
        </Form>
      )}
    </Formik>
  );
};

export default EditProductFormWrapper;
