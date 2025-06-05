import { Form, Formik, FormikHelpers } from 'formik';
import { useNavigate, useParams } from 'react-router-dom';
import { useFetchData } from 'src/hooks/useFetchData';
import { showToast } from 'src/utils/showToaster';
import { object, string } from 'yup';
import SupplierFormLayout from '../../components/SupplierFormLayout';
import { SupplierFormValues } from '../../models/Supplier.model';
import {
  useGetSupplierQuery,
  useUpdateSupplierMutation,
} from '../../service/SupplierServices';

const EditSupplierFormWrapper = () => {
  const { id: supllierId } = useParams();
  const navigate = useNavigate();
  const [updateSupplier] = useUpdateSupplierMutation();
  const { data, isLoading } = useFetchData(useGetSupplierQuery, {
    body: supllierId,
    dataType: 'VIEW',
  });
  const initialValues: SupplierFormValues = {
    supplierName: (data as any)?.data?.supplierName,
    phone: (data as any)?.data?.phone,
    email: (data as any)?.data?.email,
    address: (data as any)?.data?.address,
    city: (data as any)?.data?.city,
    region: (data as any)?.data?.region,
    country: { label: (data as any)?.data?.country },
    taxId: (data as any)?.data?.taxId,
  };

  const validationSchema = object().shape({
    supplierName: string().required('Please enter name'),
    phone: string().required('Please enter phone'),
    email: string().required('Please enter email'),
    address: string().required('Please enter address'),
    city: string().required('Please enter city'),
    region: string().required('Please enter region'),
    country: object().required('Please enter country'),
    taxId: string().required('Please enter tax no'),
  });

  const handleSubmit = (
    values: SupplierFormValues,
    { resetForm, setSubmitting }: FormikHelpers<SupplierFormValues>,
  ) => {
    let formattedValues = {
      ...values,
      country: values?.country?.label,
    };
    updateSupplier({ body: formattedValues, supllierId: supllierId }).then(
      (res: any) => {
        if (res?.error) {
          showToast('error', res?.error?.data?.message);
        } else {
          if (res?.data?.status) {
            showToast('success', res?.data?.message);
            resetForm();
            navigate('/supplier');
          } else {
            showToast('error', res?.data?.message);
          }
        }
        setSubmitting(false);
      },
    );
  };

  return (
    <Formik<SupplierFormValues>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
      enableReinitialize
    >
      {(formikProps) => (
        <Form className="h-full">
          <SupplierFormLayout
            formikProps={formikProps}
            onCancel={() => navigate('/supplier')}
            formType="EDIT"
            isLoading={isLoading}
          />
        </Form>
      )}
    </Formik>
  );
};

export default EditSupplierFormWrapper;
