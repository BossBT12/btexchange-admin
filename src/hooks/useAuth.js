import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { clearUser, setUserData } from '../store/slices/userAuthSlice';
import Cookies from 'js-cookie';

export const useAuth = () => {
  const dispatch = useDispatch();
  const cookieToken = Cookies.get('token');
  const cookieToken2 = Cookies.get('token2');
  const storedRefreshToken = Cookies.get('refreshToken');
  const data = useSelector((state) => state.userAuth);
  const user = data?.userData;
  const token = data?.token ?? cookieToken;
  const token2 = data?.token2 ?? cookieToken2;

  const clear = useCallback(() => {
    dispatch(clearUser());
    Cookies.remove('token');
    Cookies.remove('token2');
    Cookies.remove('refreshToken');
    localStorage.clear();
  }, [dispatch]);

  const setUser = useCallback((userData, token = null, token2 = null, refreshToken = null) => {
    if (token) {
      Cookies.set('token', token);
    }
    if (token2) {
      Cookies.set('token2', token2);
    }
    if (refreshToken) {
      Cookies.set('refreshToken', refreshToken);
    }
    dispatch(setUserData({ userData, token, token2 }));
  }, [dispatch]);

  return {
    userData: user,
    token,
    token2,
    isLoggedIn: Boolean(token),
    refreshToken: storedRefreshToken,
    clear,
    setUser,
  };
};

export default useAuth;
