import { Form, Formik, FormikHelpers } from 'formik';
import { createSearchParams, useNavigate, useParams } from 'react-router-dom';
import MOLLoader from 'src/components/molecules/MOLLoader/MOLLoader';
import { useFetchData } from 'src/hooks/useFetchData';
import { showToast } from 'src/utils/showToaster';
import { array, object, string } from 'yup';
import ServiceFormLayout from '../../components/ServiceFormLayout';
import { ServiceFormValues } from '../../models/Service.model';
import {
  useGetServiceByIdQuery,
  useUpdateServiceMutation,
} from '../../service/ServiceServices';

const EditServiceFormWrapper = () => {
  const navigate = useNavigate();
  const { serviceId = '' } = useParams();

  const [updateService] = useUpdateServiceMutation();
  const { data, isLoading }: any = useFetchData(useGetServiceByIdQuery, {
    body: serviceId,
  });
  const initialValues: ServiceFormValues = {
    serviceName: data?.serviceName,
    category: { _id: data?.categoryId },
    subCategory: { _id: data?.subCategoryId },
    tax: { _id: data?.taxId },
    outlets: data?.outletIds?.map((outletId: string) => ({ _id: outletId })),
    sellingPrice: String(data?.sellingPrice),
    description: data?.description,
    serviceCode: data?.serviceCode,
    termsAndConditions: data?.termsAndConditions,
    serviceImageUrl: data?.serviceImageUrl,
    products: data?.products?.map((product: any) => ({
      product: { _id: product?.productId },
      quantity: product?.quantity,
      supplyPrice: product?.product?.sellingPrice * product?.quantity,
    })),
    duration: data?.duration,
    cashback: data?.cashback,
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
    updateService({ serviceId, body: formattedValues }).then((res: any) => {
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

  if (isLoading) {
    return <MOLLoader />;
  }

  return (
    <Formik<ServiceFormValues>
      enableReinitialize
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {(formikProps) => (
        <Form>
          <ServiceFormLayout
            formikProps={formikProps}
            formType="EDIT"
            onCancel={() => navigate('/service')}
          />
        </Form>
      )}
    </Formik>
  );
};

export default EditServiceFormWrapper;
