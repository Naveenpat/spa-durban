import { FormikProps } from 'formik';
import MOLFormDialog from 'src/components/molecules/MOLFormDialog/MOLFormDialog';
import { ChangePasswordFormValues } from '../models/UserProfile.model';
import ATMPasswordField from 'src/components/atoms/FormElements/ATMPasswordField/ATMPasswordField';

type Props = {
  formikProps: FormikProps<ChangePasswordFormValues>;
  onClose: () => void;
};

const ChangePasswordFormLayout = ({ formikProps, onClose }: Props) => {
  const { values, setFieldValue, isSubmitting, handleBlur, touched, errors } =
    formikProps;

  return (
    <MOLFormDialog
      title="Change Password"
      onClose={onClose}
      isSubmitting={isSubmitting}
    >
      <div className="flex flex-col gap-4">
        {/* Current Password */}
        <div className="">
          <ATMPasswordField
            required
            name="currentPassword"
            value={values?.currentPassword}
            onChange={(e) => setFieldValue('currentPassword', e.target.value)}
            label="Current Password"
            placeholder="Enter Current Password"
            onBlur={handleBlur}
            isTouched={touched?.currentPassword}
            errorMessage={errors?.currentPassword}
            isValid={!errors?.currentPassword}
          />
        </div>
        {/* Current Password */}
        <div className="">
          <ATMPasswordField
            required
            name="newPassword"
            value={values?.newPassword}
            onChange={(e) => setFieldValue('newPassword', e.target.value)}
            label="New Password"
            placeholder="Enter New Password"
            onBlur={handleBlur}
            isTouched={touched?.newPassword}
            errorMessage={errors?.newPassword}
            isValid={!errors?.newPassword}
          />
        </div>
        {/* Current Password */}
        <div className="">
          <ATMPasswordField
            required
            name="confirmPassword"
            value={values?.confirmPassword}
            onChange={(e) => setFieldValue('confirmPassword', e.target.value)}
            label="Confirm Password"
            placeholder="Enter Confirm Password"
            onBlur={handleBlur}
            isTouched={touched?.confirmPassword}
            errorMessage={errors?.confirmPassword}
            isValid={!errors?.confirmPassword}
          />
        </div>
      </div>
    </MOLFormDialog>
  );
};

export default ChangePasswordFormLayout;
