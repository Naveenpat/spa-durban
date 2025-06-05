import { Form, Formik, FormikHelpers } from 'formik';
import { CustomerFormValues } from 'src/modules/Customer/models/Customer.model';
import { useAddCustomerMutation } from 'src/modules/Customer/service/CustomerServices';
import { showToast } from 'src/utils/showToaster';
import { date, object, string } from 'yup';
import AddCustomerFormLayout from './AddCustomerFormLayout';
import { setPreviewNewCustomerId } from '../../slice/CartSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'src/store';

type Props = {
  onClose: () => void;
};
const AddCustomerFormWrapper = ({ onClose }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const [addCustomer] = useAddCustomerMutation();
  const initialValues: CustomerFormValues = {
    customerName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    region: '',
    country: '',
    taxNo: '',
    dateOfBirth: null,
    gender: '',
  };

  const validationSchema = object().shape({
    customerName: string().required('Please enter name'),
    // phone: string()
    //   .required('Please enter phone number')
    //   .matches(/^[0-9]+$/, 'Phone number is not valid'),
    // email: string().required('Please enter email address'),
    // dateOfBirth: date().required('Please select DOB').nullable(),
    // gender: object().required('Please select gender'),
  });

  const handleSubmit = (
    values: CustomerFormValues,
    { resetForm, setSubmitting }: FormikHelpers<CustomerFormValues>,
  ) => {
    let formattedValues = {
      ...values,
      gender: values?.gender?.value,
      country: values?.country?.label,
    };

    addCustomer(formattedValues).then((res: any) => {
      if (res?.error) {
        showToast('error', res?.error?.data?.message);
      } else {
        if (res?.data?.status) {
          showToast('success', res?.data?.message);
          resetForm();

          dispatch(setPreviewNewCustomerId(res?.data?.data));
          onClose();
        } else {
          showToast('error', res?.data?.message);
        }
      }
      setSubmitting(false);
    });
  };
  return (
    <Formik<CustomerFormValues>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {(formikProps) => (
        <Form>
          <AddCustomerFormLayout formikProps={formikProps} onClose={onClose} />
        </Form>
      )}
    </Formik>
  );
};

export default AddCustomerFormWrapper;
