import { Formik, FormikHelpers, Form } from 'formik';
import React from 'react';
import { CashBackFormValues } from '../../models/CashBack.model';
import CashBackFormLayout from '../../components/CashBackFormLayout';
import { object, string } from 'yup';
import { useGetOutletsQuery } from 'src/modules/Outlet/service/OutletServices';
import { useFetchData } from 'src/hooks/useFetchData';
import { showToast } from 'src/utils/showToaster';
import { useAddCashBackMutation } from '../../service/CashBackServices';
import { useNavigate } from 'react-router-dom';

type Props = {};

const AddCashBackFormWrapper = (props: Props) => {
  const navigate = useNavigate();
  const { data } = useFetchData(useGetOutletsQuery, {});
  const [addCashBack] = useAddCashBackMutation();
  const initialValues: CashBackFormValues = {
    cashBackRulesName: '',
    howMuchCashback: '',
    cashBackDate: '',
    cashBackEndDate: '',
    serviceId: '',
  };

  const validationSchema = object().shape({
    cashBackRulesName: string().required('Please enter rule name'),
  });

  const handleSubmit = (
    values: CashBackFormValues,
    { resetForm, setSubmitting }: FormikHelpers<CashBackFormValues>,
  ) => {
    let formattedValues = {
      cashBackRulesName: values?.cashBackRulesName,
      howMuchCashback: values?.howMuchCashback?.value,
      cashBackDate: values?.cashBackDate,
      cashBackEndDate: values?.cashBackEndDate,
      serviceId: values?.serviceId?.map((serviceId: any) => serviceId?._id),
    };
    addCashBack(formattedValues).then((res: any) => {
      if (res?.error) {
        showToast('error', res?.error?.data?.message);
      } else {
        if (res?.data?.status) {
          showToast('success', res?.data?.message);
          resetForm();
          navigate('/cashback-rules');
        } else {
          showToast('error', res?.data?.message);
        }
      }
      setSubmitting(false);
    });
  };

  return (
    <Formik<CashBackFormValues>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
      enableReinitialize
    >
      {(formikProps) => (
        <Form>
          <CashBackFormLayout
            formikProps={formikProps}
            formType="ADD"
            onCancel={() => navigate('/cashback')}
          />
        </Form>
      )}
    </Formik>
  );
};

export default AddCashBackFormWrapper;
