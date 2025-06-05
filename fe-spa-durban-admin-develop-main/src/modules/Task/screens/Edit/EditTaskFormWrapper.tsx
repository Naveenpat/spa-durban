import { Formik, FormikHelpers, Form } from 'formik';
import React from 'react';
import { TaskFormValues } from '../../models/Task.model';
import TaskFormLayout from '../../components/TaskFormLayout';
import { array, object, string } from 'yup';
import {
  useGetTaskQuery,
  useUpdateTaskMutation,
} from '../../service/TaskServices';
import { showToast } from 'src/utils/showToaster';
import { useFetchData } from 'src/hooks/useFetchData';

type Props = {
  onClose: () => void;
  taskId: string;
};

const EditTaskFormWrapper = ({ onClose, taskId }: Props) => {
  const [updateTask] = useUpdateTaskMutation();
  const { data, isLoading } = useFetchData(useGetTaskQuery, {
    body: taskId,
    dataType: 'VIEW',
  });
  const initialValues: TaskFormValues = {
    task: (data as any)?.data?.task || '',
    description: (data as any)?.data?.description || '',
    outletsId: (data as any)?.data?.outletsId?.map((el: string) => ({
      _id: el,
    })),
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
    updateTask({ body: formattedValues, taskId: taskId }).then((res: any) => {
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
      enableReinitialize
    >
      {(formikProps) => (
        <Form>
          <TaskFormLayout
            formikProps={formikProps}
            onClose={onClose}
            isLoading={isLoading}
            formType="EDIT"
          />
        </Form>
      )}
    </Formik>
  );
};

export default EditTaskFormWrapper;
