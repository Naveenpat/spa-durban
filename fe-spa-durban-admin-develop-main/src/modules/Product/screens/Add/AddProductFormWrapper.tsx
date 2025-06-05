import { Formik, FormikHelpers, Form } from 'formik';
import React from 'react';
import ProductFormLayout from '../../components/ProductFormLayout';
import { object, string } from 'yup';
import { useNavigate } from 'react-router-dom';
import { setFieldCustomized } from 'src/slices/SideNavLayoutSlice';
import { AppDispatch } from 'src/store';
import { useDispatch } from 'react-redux';
import { useAddProductMutation } from '../../service/ProductServices';
import { showToast } from 'src/utils/showToaster';

type Props = {
  onClose: () => void;
};

const AddProductFormWrapper = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [addProduct] = useAddProductMutation();

  const initialValues: ProductFormValues = {
    productName: '',
    productCode: '',
    categoryId: '',
    subCategoryId: '',
    brandId: '',
    productImageUrl: '',
    description: '',
    measurementUnitId: '',
    barcode: '',
    mrp: '',
    sellingPrice: '',
    purchasePrice: '',
    tax: '',
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
    // tax: object().required('Please select tax'),
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
    addProduct(formattedValues).then((res: any) => {
      if (res?.error) {
        showToast('error', res?.error?.data?.message);
      } else {
        if (res?.data?.status) {
          showToast('success', res?.data?.message);
          resetForm();
          navigate('/product');
        } else {
          showToast('error', res?.data?.message);
        }
      }
      setSubmitting(false);
    });
  };
  return (
    <Formik<ProductFormValues>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {(formikProps) => {
        return (
          <Form>
            <ProductFormLayout
              formikProps={formikProps}
              onCancel={() => {
                navigate('/product');
              }}
              formType="ADD"
            />
          </Form>
        );
      }}
    </Formik>
  );
};

export default AddProductFormWrapper;
