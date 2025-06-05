import apiSlice from '../services/ApiSlice';
import {
  setAccessToken,
  setIsLogin,
  setOutlet,
  setOutlets,
  setRefreshToken,
  setUserData,
} from '../slices/AuthSlice';
import { clearlocalStorage } from '../utils/auth/authUtils';
import {
  authTokenKeyName,
  refreshTokenKeyName,
} from '../utils/configs/authConfig';

export const authMiddleware = (store: any) => (next: any) => (action: any) => {
  const result = next(action);

  const afterLogin = (res: any) => {
    const userData = {
      userName: res?.user?.userName,
      name: res?.user?.name,
      userId: res?.user?._id,
      userType: res?.user?.userType,
      email: res?.user?.email,
    };

    store?.dispatch(setUserData(userData));
    store?.dispatch(setOutlets(res?.outlets));
    store?.dispatch(setOutlet(res?.outlets?.[0]));
    store?.dispatch(setIsLogin(true));
    store?.dispatch(setAccessToken(res?.access));
    store?.dispatch(setRefreshToken(res?.refresh));
    localStorage.setItem(authTokenKeyName, res?.access);
    localStorage.setItem(refreshTokenKeyName, res?.refresh);
    localStorage.setItem('isLogin', 'true');
    localStorage.setItem('deviceId', res?.deviceId);

    // navigate(returnUrl ? `${returnUrl}` : '/');
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  // console.log(result?.payload?.status);

  if (result.error && result?.payload?.status === 500) {
    store
      .dispatch(
        (apiSlice as any)?.endpoints?.getAccessToken?.initiate({
          refreshToken: store.getState()?.auth?.refreshToken,
        }),
      )
      .then((res: any) => {
        if (res?.error) {
          clearlocalStorage();
          window.location.replace('/login');
        } else {
          // const userData = {
          //   userName: res?.data?.data?.userName,
          //   name: res?.data?.data?.name,
          //   userId: res?.data?.data?.adminId,
          //   userType: res?.data?.data?.userType,
          //   email: res?.data?.data?.email,
          //   mobile: res?.data?.data?.mobile,
          // };

          // store?.dispatch(setUserData(userData));
          // store?.dispatch(setIsLogin(true));
          // store?.dispatch(setAccessToken(res?.data?.data?.token));
          // store?.dispatch(setRefreshToken(res?.data?.data?.refreshToken));
          // localStorage.setItem(authTokenKeyName, res?.data?.data?.token);
          // localStorage.setItem(
          //   refreshTokenKeyName,
          //   res?.data?.data?.refreshToken,
          // );

          // setTimeout(() => {
          //   window.location.reload();
          // }, 500);

          afterLogin(res?.data?.data);
        }
      });
  }
  return result;
};
