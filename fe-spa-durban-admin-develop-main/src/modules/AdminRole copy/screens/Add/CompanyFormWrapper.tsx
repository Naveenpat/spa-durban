import { Formik, FormikHelpers, Form } from 'formik';
import { object, string } from 'yup';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../../../../utils/showToaster';
import { CompanyFormValues } from '../../models/Company.model';
import { useAddCompanyMutation } from '../../service/CompanyServices';
import CompanyFormLayout from '../../components/CompanyFormLayout';

type Props = {};

const CompanyFormWrapper = (props: Props) => {
  const navigate = useNavigate();

  const [addCompany] = useAddCompanyMutation();

  const initialValues: CompanyFormValues = {
    companyName: '',
    email: '',
    phone: '',
    logo: '',
    websiteUrl:''
  };

  const validationSchema = object().shape({
    companyName: string().required('Please enter name'),
    email: string().required('Please enter email'),
    phone: string().required('Please enter phone'),
    logo:string().required('Please select logo'),
    websiteUrl:string().required('Please enter websiteUrl')
  });

  const handleSubmit = (
    values: CompanyFormValues,
    { resetForm, setSubmitting }: FormikHelpers<CompanyFormValues>,
  ) => {


    const formattedValues = {
      companyName: values?.companyName,
      email: values?.email,
      phone: values?.phone,
      logo: values?.logo,
      websiteUrl:values?.websiteUrl
    };

    // console.log('-------ressss',formattedValues)

    addCompany(formattedValues).then((res: any) => {
      if (res?.error) {
        showToast('error', res?.error?.data?.message);
      } else {
        if (res?.data?.status) {
          showToast('success', res?.data?.message);
          resetForm();
          navigate(`/company`);
        } else {
          showToast('error', res?.data?.message);
        }
      }
      setSubmitting(false);
    });
  };

  return (
    <Formik<CompanyFormValues>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {(formikProps) => (
        <Form className="h-full">
          <CompanyFormLayout
            formikProps={formikProps}
            onCancel={() => navigate(`/company`)}
          />
        </Form>
      )}
    </Formik>
  );
};

export default CompanyFormWrapper;
