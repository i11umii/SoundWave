import { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext();

export function AuthProvider(props) {
  const children = props.children;

  // берем токен из localStorage, чтобы не выкидывать пользователя после перезагрузки
  const tokenFromStorage = localStorage.getItem('token');

  let initialIsAuthenticated = false;
  if (tokenFromStorage) {
    initialIsAuthenticated = true;
  }

  const [token, setToken] = useState(tokenFromStorage);
  const [isAuthenticated, setIsAuthenticated] = useState(initialIsAuthenticated);
  const [user, setUser] = useState(null);

  async function fetchMe() {
    console.log('AuthContext: fetchMe start');

    try {
      const response = await authAPI.getMe();

      let me = null;
      if (response && response.data && response.data.data) {
        me = response.data.data;
      }

      setUser(me);
      console.log('AuthContext: fetchMe success', me ? me._id : null);
    } catch (error) {
      console.log(error);
      setUser(null);
    }
  }

  useEffect(() => {
    console.log('AuthContext: token changed', token ? 'HAS_TOKEN' : 'NO_TOKEN');

    if (token) {
      fetchMe();
    } else {
      setUser(null);
    }
  }, [token]);

  function login(newToken, newUser) {
    console.log('AuthContext: login');

    localStorage.setItem('token', newToken);
    setToken(newToken);

    setUser(newUser);
    setIsAuthenticated(true);
  }

  function logout() {
    console.log('AuthContext: logout');

    localStorage.removeItem('token');
    setToken(null);

    setUser(null);
    setIsAuthenticated(false);
  }

  function updateUser(updatedUser) {
    console.log('AuthContext: updateUser');
    setUser(updatedUser);
  }

  const value = {
    user: user,
    token: token,
    isAuthenticated: isAuthenticated,
    login: login,
    logout: logout,
    updateUser: updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
