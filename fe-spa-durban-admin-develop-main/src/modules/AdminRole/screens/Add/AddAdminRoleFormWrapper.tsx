import { Formik, FormikHelpers, Form } from 'formik';
import { AdminRoleFormValues } from '../../models/AdminRole.model';
import AdminRoleFormLayout from '../../components/AdminRoleFormLayout';
import { object, string } from 'yup';
import { useNavigate } from 'react-router-dom';
import accessDataJson from '../../components/UserAccess/userAccessData.json';
import { useAddAdminRoleMutation } from '../../service/AdminRoleServices';
import { showToast } from '../../../../utils/showToaster';

type Props = {};

const AddAdminRoleFormWrapper = (props: Props) => {
  const navigate = useNavigate();

  const [addAdminRole] = useAddAdminRoleMutation();

  const initialValues: AdminRoleFormValues = {
    roleName: '',
    modules: [],
  };

  const validationSchema = object().shape({
    roleName: string().required('Please enter name'),
  });

  const handleSubmit = (
    values: AdminRoleFormValues,
    { resetForm, setSubmitting }: FormikHelpers<AdminRoleFormValues>,
  ) => {
    const userModules = accessDataJson?.accessData?.reduce(
      (result: string[], access) => {
        const isDependecyIncludes = access?.dependencies?.some((dependency) =>
          values?.modules?.includes(dependency),
        );

        if (isDependecyIncludes) {
          if (result?.includes(access?.moduleId)) {
            return result;
          } else {
            return [...result, access?.moduleId];
          }
        } else {
          const newValue = result?.filter((el) => el !== access?.moduleId);
          return newValue;
        }
      },
      [...values?.modules],
    );

    const formattedValues = {
      roleName: values?.roleName,
      permissions: userModules
    };

    addAdminRole(formattedValues).then((res: any) => {
      if (res?.error) {
        showToast('error', res?.error?.data?.message);
      } else {
        if (res?.data?.status) {
          showToast('success', res?.data?.message);
          resetForm();
          navigate(`/admin-role`);
        } else {
          showToast('error', res?.data?.message);
        }
      }
      setSubmitting(false);
    });
  };

  return (
    <Formik<AdminRoleFormValues>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {(formikProps) => (
        <Form className="h-full">
          <AdminRoleFormLayout
            formikProps={formikProps}
            onCancel={() => navigate(`/admin-role`)}
          />
        </Form>
      )}
    </Formik>
  );
};

export default AddAdminRoleFormWrapper;
