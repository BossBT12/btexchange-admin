import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { clearUser, setUserData2 } from '../store/slices/userAuthSlice';
import Cookies from 'js-cookie';
import networkService from '../services/networkService';

export const useAuth2 = () => {
  const dispatch = useDispatch();
  const cookieToken = Cookies.get('token2');
  const data = useSelector((state) => state.userAuth);
  const user = data?.userData2;
  const token = data?.token2 ?? cookieToken;

  const clear = useCallback(() => {
    dispatch(clearUser());
    Cookies.remove('token2');
    Cookies.remove('refreshToken2');
  }, [dispatch]);

  const setUser = useCallback((userData, token) => {
    if (token) {
      Cookies.set('token2', token);
    }
    dispatch(setUserData2({ userData2: userData, token2: token }));
  }, [dispatch]);

  // const getUserData = useCallback(async () => {
  //   if (!token) return null;
  //   try {
  //     const response = await networkService.getProfile();
  //     if (response.success) {
  //       dispatch(setUserData2({ userData2: response.data.user, token2: token }));
  //       return response.data.user;
  //     }
  //     return null;
  //   } catch (error) {
  //     console.error('Error fetching user data:', error);
  //     return null;
  //   }
  // }, [token, dispatch]);

  return {
    userData: user,
    token,
    isLoggedIn: Boolean(token),
    clear,
    setUser,
  };
};

export default useAuth2;
