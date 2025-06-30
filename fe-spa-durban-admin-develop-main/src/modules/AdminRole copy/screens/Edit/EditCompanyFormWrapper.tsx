import { Formik, FormikHelpers, Form } from 'formik';
import AdminRoleFormLayout from '../../components/CompanyFormLayout';
import { object, string } from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import { useFetchData } from '../../../../hooks/useFetchData';
import { showToast } from '../../../../utils/showToaster';
import { CompanyFormValues } from '../../models/Company.model';
import { useGetCompanyByIdQuery, useUpdateCompanyMutation } from '../../service/CompanyServices';

type Props = {};

const EditCompanyFormWrapper = (props: Props) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [updateAdminRole] = useUpdateCompanyMutation();
  const { data, isLoading } = useFetchData(useGetCompanyByIdQuery, {
    body: id,
    dataType: 'VIEW',
  });

  const initialValues: CompanyFormValues = {
    companyName: (data as any)?.data?.companyName || '',
    email: (data as any)?.data?.email || '',
    phone: (data as any)?.data?.phone || '',
    logo: (data as any)?.data?.logo || '',
    websiteUrl: (data as any)?.data?.websiteUrl || '',
  };


  const validationSchema = object().shape({
    companyName: string().required('Please enter name'),
    email: string().required('Please enter email'),
    phone: string().required('Please enter phone'),
    logo: string().required('Please select logo'),
    websiteUrl: string().required('Please enter websiteUrl')
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
      websiteUrl: values?.websiteUrl
    };

    updateAdminRole({ companyId: id, body: formattedValues }).then(
      (res: any) => {
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
      },
    );
  };

  return (
    <Formik<CompanyFormValues>
      enableReinitialize
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {(formikProps) => (
        <Form className="h-full">
          <AdminRoleFormLayout
            formikProps={formikProps}
            formType="EDIT"
            onCancel={() => navigate(`/company`)}
            isLoading={isLoading}
          />
        </Form>
      )}
    </Formik>
  );
};

export default EditCompanyFormWrapper;
