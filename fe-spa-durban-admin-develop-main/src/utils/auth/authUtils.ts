import { authTokenKeyName, refreshTokenKeyName } from '../configs/authConfig';

export const clearlocalStorage = () => {
  localStorage.removeItem(authTokenKeyName);
  localStorage.removeItem(refreshTokenKeyName);
  localStorage.removeItem('isLogin');
};
