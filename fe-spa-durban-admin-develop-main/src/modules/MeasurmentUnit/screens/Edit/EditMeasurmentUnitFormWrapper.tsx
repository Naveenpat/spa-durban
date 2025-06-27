import { Formik, FormikHelpers, Form } from 'formik';
import React from 'react';
import {
  MeasurmentUnit,
  MeasurmentUnitFormValues,
} from '../../models/MeasurmentUnit.model';
import MeasurmentUnitFormLayout from '../../components/MeasurmentUnitFormLayout';
import { object, string } from 'yup';
import { useFetchData } from 'src/hooks/useFetchData';
import {
  useGetMeasurementUnitQuery,
  useUpdateMeasurementUnitMutation,
} from '../../service/MeasurmentUnitServices';
import { showToast } from 'src/utils/showToaster';

type Props = {
  onClose: () => void;
  measurementUnitId: string;
};

const EditMeasurmentUnitFormWrapper = ({
  onClose,
  measurementUnitId,
}: Props) => {
  const [updateMeasurmentUnit] = useUpdateMeasurementUnitMutation();
  const { data, isLoading } = useFetchData(useGetMeasurementUnitQuery, {
    body: measurementUnitId,
    dataType: 'VIEW',
  });
  const initialValues: MeasurmentUnitFormValues = {
    unitName: (data as any)?.data?.unitName,
    unitCode: (data as any)?.data?.unitCode,
  };

  const validationSchema = object().shape({
    unitName: string().required('Please enter unit name'),
    unitCode: string().required('Please enter code'),
  });

  const handleSubmit = (
    values: MeasurmentUnitFormValues,
    { resetForm, setSubmitting }: FormikHelpers<MeasurmentUnitFormValues>,
  ) => {
    updateMeasurmentUnit({
      body: values,
      measurementUnitId: measurementUnitId,
    }).then((res: any) => {
      if (res?.error) {
        showToast('error', res?.error?.data?.message);
      } else {
        if (res?.data?.status) {
          showToast('success', 'Measurment updated successfully');
          resetForm();
          onClose();
        } else {
          showToast('error', res?.data?.message);
        }
      }
      setSubmitting(false);
    });
  };

  return (
    <Formik<MeasurmentUnitFormValues>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
      enableReinitialize
    >
      {(formikProps) => (
        <Form>
          <MeasurmentUnitFormLayout
            formType="Update"
            formikProps={formikProps}
            onClose={onClose}
            isLoading={isLoading}
          />
        </Form>
      )}
    </Formik>
  );
};

export default EditMeasurmentUnitFormWrapper;
