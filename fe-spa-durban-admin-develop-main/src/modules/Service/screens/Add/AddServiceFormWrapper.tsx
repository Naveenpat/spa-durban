import { Form, Formik, FormikHelpers } from 'formik';
import { array, object, string } from 'yup';
import ServiceFormLayout from '../../components/ServiceFormLayout';
import { ServiceFormValues } from '../../models/Service.model';
import { useAddServiceMutation } from '../../service/ServiceServices';
import { showToast } from 'src/utils/showToaster';
import { createSearchParams, useNavigate } from 'react-router-dom';

const AddServiceFormWrapper = () => {
  const navigate = useNavigate();
  const [addService] = useAddServiceMutation();

  const initialValues: ServiceFormValues = {
    serviceName: '',
    category: '',
    subCategory: '',
    tax: '',
    outlets: [],
    sellingPrice: '',
    description: '',
    serviceCode: '',
    termsAndConditions: '',
    serviceImageUrl: '',
    products: [],
    duration: '',
    cashback: '',
  };

  const validationSchema = object().shape({
    serviceName: string().required('Please enter name'),
    // category: object().required('Please select category'),
    // sellingPrice: string().required('Please enter selling price'),
    // description: string().required('Please enter description'),
    // termsAndConditions: string().required('Please enter terms and condition'),
    // products: array().of(
    //   object().shape({
    //     product: object().required('Please select product'),
    //     quantity: string().required('Please enter quantity'),
    //   }),
    // ),
    // outlets: array()
    //   .min(1, 'Please select outlet')
    //   .required('Please select outlet'),
  });

  const handleSubmit = (
    values: ServiceFormValues,
    { resetForm, setSubmitting }: FormikHelpers<ServiceFormValues>,
  ) => {
    const formattedValues = {
      serviceName: values?.serviceName,
      categoryId: values?.category?._id,
      subCategoryId: values?.subCategory?._id || null,
      serviceCode: values?.serviceCode,
      sellingPrice: Number(values?.sellingPrice),
      taxId: values?.tax?._id || null,
      outletIds: values?.outlets?.map((outlet) => outlet?._id),
      description: values?.description,
      termsAndConditions: values?.termsAndConditions,
      serviceImageUrl: values?.serviceImageUrl,
      products: values?.products?.map((product) => ({
        productId: product?.product?._id,
        quantity: Number(product?.quantity),
      })),
      duration: values?.duration,
      cashback: values?.cashback,
    };
    addService(formattedValues).then((res: any) => {
      if (res?.error) {
        showToast('error', res?.error?.data?.message);
      } else {
        if (res?.data?.status) {
          showToast('success', res?.data?.message);
          resetForm();
          navigate({
            pathname: `/service`,
            search: createSearchParams({
              page: '1',
              limit: '10',
            }).toString(),
          });
        } else {
          showToast('error', res?.data?.message);
        }
      }
      setSubmitting(false);
    });
  };

  return (
    <Formik<ServiceFormValues>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {(formikProps) => (
        <Form>
          <ServiceFormLayout
            formikProps={formikProps}
            formType="ADD"
            onCancel={() => navigate('/service')}
          />
        </Form>
      )}
    </Formik>
  );
};

export default AddServiceFormWrapper;
