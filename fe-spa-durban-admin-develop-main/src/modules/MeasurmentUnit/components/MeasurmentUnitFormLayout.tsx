import { FormikProps } from 'formik';
import ATMTextField from 'src/components/atoms/FormElements/ATMTextField/ATMTextField';
import MOLFormDialog from 'src/components/molecules/MOLFormDialog/MOLFormDialog';
import { MeasurmentUnitFormValues } from '../models/MeasurmentUnit.model';
import ATMCircularProgress from 'src/components/atoms/ATMCircularProgress/ATMCircularProgress';

type Props = {
  formikProps: FormikProps<MeasurmentUnitFormValues>;
  onClose: () => void;
  formType: 'Add' | 'Update';
  isLoading?: boolean;
};

const MeasurmentUnitFormLayout = ({
  formikProps,
  onClose,
  formType,
  isLoading = false,
}: Props) => {
  const { values, setFieldValue, isSubmitting, handleBlur, touched, errors } =
    formikProps;

  return (
    <MOLFormDialog
      title={`${formType} Measurment Unit`}
      onClose={onClose}
      isSubmitting={isSubmitting}
    >
      {isLoading ? (
        <div className="flex justify-center items-center  h-[150px]">
          <ATMCircularProgress />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {/* Name */}
          <div className="">
            <ATMTextField
              required
              name="unitName"
              value={values?.unitName}
              onChange={(e) => setFieldValue('unitName', e.target.value)}
              label="Name"
              placeholder="Enter Name"
              onBlur={handleBlur}
              isTouched={touched?.unitName}
              errorMessage={errors?.unitName}
              isValid={!errors?.unitName}
            />
          </div>
          {/* Code */}
          <div className="">
            <ATMTextField
              required
              name="unitCode"
              value={values?.unitCode}
              onChange={(e) => setFieldValue('unitCode', e.target.value)}
              label="Code"
              placeholder="Enter Code"
              onBlur={handleBlur}
              isTouched={touched?.unitCode}
              errorMessage={errors?.unitCode}
              isValid={!errors?.unitCode}
            />
          </div>
        </div>
      )}
    </MOLFormDialog>
  );
};

export default MeasurmentUnitFormLayout;
