import { FormikProps } from 'formik';
import ATMTextField from 'src/components/atoms/FormElements/ATMTextField/ATMTextField';
import MOLFormDialog from 'src/components/molecules/MOLFormDialog/MOLFormDialog';
import { TaskFormValues } from '../models/Task.model';
import ATMMultiSelect from 'src/components/atoms/FormElements/ATMMultiSelect/ATMMultiSelect';
import { useFetchData } from 'src/hooks/useFetchData';
import { useGetOutletsQuery } from 'src/modules/Outlet/service/OutletServices';
import ATMTextArea from 'src/components/atoms/FormElements/ATMTextArea/ATMTextArea';
import ATMCircularProgress from 'src/components/atoms/ATMCircularProgress/ATMCircularProgress';

type Props = {
  formikProps: FormikProps<TaskFormValues>;
  onClose: () => void;
  isLoading?: boolean;
  formType: 'ADD' | 'EDIT';
};

const TaskFormLayout = ({
  formikProps,
  onClose,
  isLoading,
  formType,
}: Props) => {
  const { values, setFieldValue, isSubmitting, handleBlur, touched, errors } =
    formikProps;
  const { data: outletsData } = useFetchData(useGetOutletsQuery, {
    body: {
      isPaginationRequired: false,
      filterBy: JSON.stringify([
        {
          fieldName: 'isActive',
          value: true,
        },
      ]),
    },
  });
  return (
    <MOLFormDialog
      title={formType === 'ADD' ? 'Add Task' : 'Update Task'}
      onClose={onClose}
      isSubmitting={isSubmitting}
    >
      {isLoading ? (
        <div className="flex items-center justify-center h-[280px]">
          <ATMCircularProgress />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {/* Outlets */}
          <div className="col-span-3">
            <ATMMultiSelect
              name="outletsId"
              value={values?.outletsId || []}
              onChange={(newValue) => setFieldValue('outletsId', newValue)}
              label="Outlets"
              options={outletsData}
              getOptionLabel={(options) => options?.name}
              valueAccessKey="_id"
              placeholder="Please Select Outlets"
            />
          </div>
          {/* Name */}
          <div className="">
            <ATMTextField
              required
              name="task"
              value={values.task}
              onChange={(e) => setFieldValue('task', e.target.value)}
              label="Task"
              placeholder="Enter Task"
              onBlur={handleBlur}
              isTouched={touched?.task}
              errorMessage={errors?.task}
              isValid={!errors?.task}
            />
          </div>
          {/* description */}
          <div className="">
            <ATMTextArea
              required
              name="description"
              value={values.description}
              onChange={(e) => setFieldValue('description', e.target.value)}
              label="Description"
              placeholder="Enter Description"
              onBlur={handleBlur}
              isTouched={touched?.description}
              errorMessage={errors?.description}
              isValid={!errors?.description}
            />
          </div>
        </div>
      )}
    </MOLFormDialog>
  );
};

export default TaskFormLayout;
