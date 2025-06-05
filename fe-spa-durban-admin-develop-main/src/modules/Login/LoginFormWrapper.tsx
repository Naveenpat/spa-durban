import { Form, Formik, FormikHelpers } from 'formik';
import { useDispatch, useSelector } from 'react-redux';

import { object, string } from 'yup';
import LoginForm from './LoginForm';

import { Navigate, useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../store';
import {
  setAccessToken,
  setIsLogin,
  setOutlet,
  setOutlets,
  setRefreshToken,
  setUserData,
} from '../../slices/AuthSlice';
import {
  authTokenKeyName,
  refreshTokenKeyName,
} from '../../utils/configs/authConfig';
import { useLoginMutation } from '../../services/AuthServices';
import { showToast } from '../../utils/showToaster';

export type LoginFormInitialValues = {
  email: string;
  password: string;
};

const LoginFormWrapper = () => {
  const { returnUrl, isLogin } = useSelector((state: RootState) => state?.auth);
  const navigate = useNavigate();

  const dispatch = useDispatch<AppDispatch>();

  const afterLogin = (res: any) => {
    const userData = {
      userName: res?.user?.userName,
      name: res?.user?.name,
      userId: res?.user?._id,
      userType: res?.user?.userType,
      email: res?.user?.email,
    };

    dispatch(setUserData(userData));
    dispatch(setOutlets(res?.outlets));
    dispatch(setOutlet(res?.outlets?.[0]));
    dispatch(setIsLogin(true));
    dispatch(setAccessToken(res?.access));
    dispatch(setRefreshToken(res?.refresh));
    localStorage.setItem(authTokenKeyName, res?.access);
    localStorage.setItem(refreshTokenKeyName, res?.refresh);
    localStorage.setItem('isLogin', 'true');
    localStorage.setItem('deviceId', res?.deviceId);

    // navigate(returnUrl ? `${returnUrl}` : '/');
    // navigate('/');
    window.location.replace('/pos');
  };

  const [login] = useLoginMutation();

  const initialValues: LoginFormInitialValues = {
    email: '',
    password: '',
  };

  const validationSchema = object({
    email: string()
      .email('Please enter a valid email')
      .required('Please enter user name'),
    password: string().required('Password is required'),
  });

  const handleSubmit = (
    values: LoginFormInitialValues,
    { setSubmitting }: FormikHelpers<LoginFormInitialValues>,
  ) => {
    setSubmitting(true);

    login(values).then((res: any) => {
      setSubmitting(false);
      if (res.error) {
        showToast('error', res?.error?.data?.message);
      } else {
        if (res?.data?.status) {
          afterLogin(res?.data?.data);
          showToast('success', res?.data?.message);
        } else {
          showToast('error', res?.data?.message);
        }
      }
    });
  };

  if (isLogin) {
    return <Navigate to="/" />;
  }

  return (
    <>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {(formikProps) => (
          <Form>
            <LoginForm formikProps={formikProps} />
          </Form>
        )}
      </Formik>
    </>
  );
};

export default LoginFormWrapper;
