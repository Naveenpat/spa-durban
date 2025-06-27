import { Formik, FormikHelpers, Form } from 'formik';
import React, { useEffect, useState } from 'react';
import { object, string } from 'yup';
import { useGetOutletQuery } from 'src/modules/Outlet/service/OutletServices';
import { useFetchData } from 'src/hooks/useFetchData';
import { useNavigate, useParams } from 'react-router-dom';
import { showToast } from 'src/utils/showToaster';
import { CustomerGroupFormValues } from '../../models/CustomerGroup.model';
import CustomerGroupFormLayout from '../../components/CustomerGroupFormLayout';
import { useGetCustomerGroupQuery, useUpdateCustomerGroupMutation } from '../../service/CustomerGroupServices';

type Props = {};

const EditCustomerGroupFormWrapper = (props: Props) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [updateCashBack] = useUpdateCustomerGroupMutation();
  const { data: cashbackData, isLoading } = useFetchData(useGetCustomerGroupQuery, {
    body: id,
    dataType: 'VIEW',
  });

  const initialValues: CustomerGroupFormValues = {
    customerGroupName: (cashbackData as any)?.data?.customerGroupName || ''
  };

  const validationSchema = object().shape({
    cashBackRulesName: string().required('Please enter title'),
  });

  const handleSubmit = (
    values: CustomerGroupFormValues,
    { resetForm, setSubmitting }: FormikHelpers<CustomerGroupFormValues>,
  ) => {
    let formattedValues = {
      customerGroupName: values?.customerGroupName
    };

    //     let formattedValues: any = {
    //   cashBackRulesName: values?.cashBackRulesName,
    //   howMuchCashback: values?.howMuchCashback?.value,
    //   serviceId: values?.serviceId?.map((serviceId: any) => serviceId?._id)
    // };

    // Conditionally include fields based on selection
    // if (selectDateOrDays === 'days') {
    //       formattedValues = {
    //         ...formattedValues,
    //         activeDays: values?.activeDays,
    //         startTime: values?.startTime,
    //         endTime: values?.endTime,
    //         cashBackDate: null,
    //         cashBackEndDate: null
    //       };
    //     } else if (selectDateOrDays === 'date') {
    //       formattedValues = {
    //         ...formattedValues,
    //         cashBackDate: values?.cashBackDate,
    //         cashBackEndDate: values?.cashBackEndDate,
    //         activeDays: [],
    //         startTime: null,
    //         endTime: null
    //       }
    //     }

    updateCashBack({ body: formattedValues, cashBackId: id }).then(
      (res: any) => {
        if (res?.error) {
          showToast('error', res?.error?.data?.message);
        } else {
          if (res?.data?.status) {
            showToast('success', res?.data?.message);
            resetForm();
            navigate('/customer-group');
          } else {
            showToast('error', res?.data?.message);
          }
        }
        setSubmitting(false);
      },
    );
  };

  return (
    <Formik<CustomerGroupFormValues>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
      enableReinitialize
    >
      {(formikProps) => (
        <Form className="h-full">
          <CustomerGroupFormLayout
            formikProps={formikProps}
            formType="EDIT"
            onCancel={() => navigate('/customer-group')}
            isLoading={isLoading}
          />
        </Form>
      )}
    </Formik>
  );
};

export default EditCustomerGroupFormWrapper;
