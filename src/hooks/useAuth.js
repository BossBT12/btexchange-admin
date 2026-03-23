import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useState } from 'react';
import { clearUser, setUserData } from '../store/slices/userAuthSlice';
import Cookies from 'js-cookie';

export const useAuth = () => {
  const dispatch = useDispatch();
  const cookieToken = Cookies.get('token');
  const storedRefreshToken = Cookies.get('refreshToken');
  const data = useSelector((state) => state.userAuth);
  const user = data?.userData;
  const token = data?.token ?? cookieToken;

  // Initialize isSecondGame from localStorage
  const getIsSecondGame = () => {
    const isSecondGame = localStorage.getItem('isSecondGame');
    return isSecondGame ? JSON.parse(isSecondGame) : false;
  };

  const [isSecondGame, setIsSecondGameState] = useState(() => getIsSecondGame());

  const clear = useCallback(() => {
    dispatch(clearUser());
    Cookies.remove('token');
    Cookies.remove('refreshToken');
    localStorage.clear();
  }, [dispatch]);

  const setUser = useCallback((userData, token, refreshToken) => {
    if (token) {
      Cookies.set('token', token);
    }
    if (refreshToken) {
      Cookies.set('refreshToken', refreshToken);
    }
    dispatch(setUserData({ userData, token }));
  }, [dispatch]);

  // const getUserData = useCallback(async () => {
  //   if (!token) return null;
  //   try {
  //     const response = await authService.getUser();
  //     if (response.success) {
  //       dispatch(setUserData({ userData: response.data.user, token }));
  //       return response.data.user;
  //     }
  //     return null;
  //   } catch (error) {
  //     console.error('Error fetching user data:', error);
  //     return null;
  //   }
  // }, [token, dispatch]);

  const setIsSecondGame = useCallback((value) => {
    const newValue = typeof value === 'function' ? value(isSecondGame) : value;
    localStorage.setItem('isSecondGame', JSON.stringify(newValue));
    setIsSecondGameState(newValue);
  }, [isSecondGame]);

  return {
    userData: user,
    token,
    isLoggedIn: Boolean(token),
    refreshToken: storedRefreshToken,
    isSecondGame,
    clear,
    setUser,
    setIsSecondGame,
  };
};

export default useAuth;
