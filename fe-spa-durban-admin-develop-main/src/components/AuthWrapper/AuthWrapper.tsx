import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useLocation, useSearchParams } from 'react-router-dom';
import ATMCircularProgress from '../atoms/ATMCircularProgress/ATMCircularProgress';
import { AppDispatch, RootState } from '../../store';
import { useFetchData } from '../../hooks/useFetchData';
import { useGetRolesOfAnAdminQuery } from '../../modules/AdminRole/service/AdminRoleServices';
import {
  setIsLogin,
  setOutlet,
  setOutlets,
  setPermissions,
  setReturnUrl,
  setUserData,
  setAccessToken,
  setRefreshToken,
} from '../../slices/AuthSlice';
import { useLoginAutoMutation } from '../../services/AuthServices';
import { showToast } from '../../utils/showToaster';
import {
  authTokenKeyName,
  refreshTokenKeyName,
} from '../../utils/configs/authConfig';

type Props = {
  children: JSX.Element;
};

const AuthWrapper = ({ children }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLogin } = useSelector((state: RootState) => state.auth);
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const [isChecking, setIsChecking] = useState(true);
  const [login] = useLoginAutoMutation();
  const bookingUserId = searchParams.get('bookingUserId');

  const { data, isLoading } = useFetchData(useGetRolesOfAnAdminQuery, {
    dataType: 'VIEW',
  });

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

    // Use localStorage to keep this login in the current tab only
    localStorage.setItem(authTokenKeyName, res?.access);
    localStorage.setItem(refreshTokenKeyName, res?.refresh);
    localStorage.setItem('isLogin', 'true');
    localStorage.setItem('deviceId', res?.deviceId);

    showToast('success', 'Auto-login successful');
    setIsChecking(false);
  };

  useEffect(() => {
    const sessionAlreadyLoggedIn = localStorage.getItem('isLogin') === 'true';

    if (!sessionAlreadyLoggedIn && pathname.startsWith('/pos') && bookingUserId) {
      console.log('Auto-login with bookingUserId:', bookingUserId);

      login({ bookingUserId }).then((res: any) => {
        if (res.error) {
          showToast('error', res?.error?.data?.message);
          setIsChecking(false);
        } else if (res?.data?.status) {
          afterLogin(res?.data?.data);
        } else {
          showToast('error', res?.data?.message);
          setIsChecking(false);
        }
      });

      return;
    }

    // For users already logged in (shared or admin login)
    if (!isLoading) {
      const userData = {
        userName: (data as any)?.data?.userdata?.userName,
        name: (data as any)?.data?.userdata?.name,
        userId: (data as any)?.data?.userdata?.userID,
        userType: (data as any)?.data?.userdata?.userType,
        email: (data as any)?.data?.userdata?.email,
        mobile: (data as any)?.data?.userdata?.phone,
      };

      dispatch(setOutlets((data as any)?.data?.outlets));
      dispatch(setOutlet((data as any)?.data?.outlets?.[0]));
      dispatch(setUserData(userData));
      dispatch(setPermissions((data as any)?.data?.permissions));

      setTimeout(() => {
        setIsChecking(false);
      }, 500);
    } else {
      setIsChecking(true);
    }
  }, [isLoading, data, pathname, bookingUserId]);

  if (isChecking) {
    return (
      <div className="flex flex-col items-center justify-center w-screen h-screen">
        <ATMCircularProgress />
        <div className="text-center">
          Please wait, We are checking your authentication
        </div>
      </div>
    );
  }

  // Check current tab session login
  if (!localStorage.getItem('isLogin')) {
    dispatch(setReturnUrl(pathname));
    return <Navigate to={'/login'} />;
  }

  return children;
};

export default AuthWrapper;
