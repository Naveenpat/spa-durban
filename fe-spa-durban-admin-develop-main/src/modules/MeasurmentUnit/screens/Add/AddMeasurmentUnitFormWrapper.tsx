import { Formik, FormikHelpers, Form } from 'formik';
import React from 'react';
import { MeasurmentUnitFormValues } from '../../models/MeasurmentUnit.model';
import MeasurmentUnitFormLayout from '../../components/MeasurmentUnitFormLayout';
import { object, string } from 'yup';
import { useAddMeasurementUnitMutation } from '../../service/MeasurmentUnitServices';
import { showToast } from 'src/utils/showToaster';

type Props = {
  onClose: () => void;
};

const AddMeasurmentUnitFormWrapper = ({ onClose }: Props) => {
  const [addMeasurmentUnit] = useAddMeasurementUnitMutation();
  const initialValues: MeasurmentUnitFormValues = {
    unitName: '',
    unitCode: '',
  };

  const validationSchema = object().shape({
    unitName: string().required('Please enter unit name'),
    unitCode: string().required('Please enter code'),
  });

  const handleSubmit = (
    values: MeasurmentUnitFormValues,
    { resetForm, setSubmitting }: FormikHelpers<MeasurmentUnitFormValues>,
  ) => {
    addMeasurmentUnit(values).then((res: any) => {
      if (res?.error) {
        showToast('error', res?.error?.data?.message);
      } else {
        if (res?.data?.status) {
          showToast('success', 'Measurment added successfully');
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
    >
      {(formikProps) => (
        <Form>
          <MeasurmentUnitFormLayout
            formType="Add"
            formikProps={formikProps}
            onClose={onClose}
          />
        </Form>
      )}
    </Formik>
  );
};

export default AddMeasurmentUnitFormWrapper;
