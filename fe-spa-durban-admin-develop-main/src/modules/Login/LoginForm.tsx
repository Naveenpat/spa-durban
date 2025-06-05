import { FormikProps } from 'formik';
import { ATMButton } from '../../components/atoms/ATMButton/ATMButton';
import ATMPasswordField from '../../components/atoms/FormElements/ATMPasswordField/ATMPasswordField';
import ATMTextField from '../../components/atoms/FormElements/ATMTextField/ATMTextField';
import { LoginFormInitialValues } from './LoginFormWrapper';
type Props = {
  formikProps: FormikProps<LoginFormInitialValues>;
};

const LoginForm = ({ formikProps }: Props) => {
  const { values, setFieldValue, isSubmitting, handleBlur, errors, touched } =
    formikProps;

  return (
    <div className="flex justify-center w-full h-screen bg-login ">
      <div className="">
        <div className="flex items-center justify-center w-full h-full p-8 rounded-md ">
          <div className="flex flex-col gap-6  md:w-[700px] w-full h-fit card-login p-10 border border-gray-400">
            <div className="flex flex-col items-center justify-center gap-2 text-center">
              <img
                src="/spadurbanLogo.jpeg"
                alt="logo"
                className="w-[150px] h-[120px] text-center"
              />
            </div>

            <div className="flex flex-col gap-4">
              {/* User Name */}
              <div className="">
                <ATMTextField
                  name="email"
                  value={values.email}
                  onChange={(e) => setFieldValue('email', e.target.value)}
                  label="User Name"
                  placeholder="Enter User Name"
                  onBlur={handleBlur}
                  isTouched={touched?.email}
                  errorMessage={errors?.email}
                  isValid={!errors?.email}
                />
              </div>

              {/* Password */}
              <div className="">
                <ATMPasswordField
                  placeholder="Enter Password"
                  name="password"
                  value={values.password}
                  onChange={(e) => setFieldValue('password', e.target.value)}
                  label="Password"
                  onBlur={handleBlur}
                  isTouched={touched?.password}
                  errorMessage={errors?.password}
                  isValid={!errors?.password}
                />
              </div>
            </div>
            <div>
              <ATMButton isLoading={isSubmitting} type="submit">
                Login
              </ATMButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
