import { Formik, FormikHelpers, Form } from 'formik';
import React from 'react';
import { TaskFormValues } from '../../models/Task.model';
import TaskFormLayout from '../../components/TaskFormLayout';
import { array, object, string } from 'yup';
import { useAddTaskMutation } from '../../service/TaskServices';
import { showToast } from 'src/utils/showToaster';

type Props = {
  onClose: () => void;
};

const AddTaskFormWrapper = ({ onClose }: Props) => {
  const [addTask] = useAddTaskMutation();
  const initialValues: TaskFormValues = {
    task: '',
    description: '',
    outletsId: '',
  };

  const validationSchema = object().shape({
    task: string().required('Please enter name'),
    description: string().required('Please enter description'),
    outletsId: array().required('Please select Outlet'),
  });

  const handleSubmit = (
    values: TaskFormValues,
    { resetForm, setSubmitting }: FormikHelpers<TaskFormValues>,
  ) => {
    let formattedValues = {
      ...values,
      outletsId: values?.outletsId?.map((outletsId: any) => outletsId?._id),
    };
    addTask(formattedValues).then((res: any) => {
      if (res?.error) {
        showToast('error', res?.error?.data?.message);
      } else {
        if (res?.data?.status) {
          showToast('success', res?.data?.message);
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
    <Formik<TaskFormValues>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {(formikProps) => (
        <Form>
          <TaskFormLayout
            formikProps={formikProps}
            onClose={onClose}
            formType="ADD"
          />
        </Form>
      )}
    </Formik>
  );
};

export default AddTaskFormWrapper;
