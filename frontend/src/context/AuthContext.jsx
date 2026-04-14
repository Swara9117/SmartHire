import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedInState] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(null);

  // Load login state, user, and token from localStorage on initial load
  useEffect(() => {
    const storedLogin = localStorage.getItem('isLoggedIn');
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedLogin === 'true' && storedUser && storedToken) {
      setIsLoggedInState(true);
      setUser(JSON.parse(storedUser));
      setTokenState(storedToken);
    }
  }, []);

  // Update state and localStorage for login, user, and token
  const setIsLoggedIn = (value, userObj = null, tokenValue = null) => {
    setIsLoggedInState(value);
    localStorage.setItem('isLoggedIn', value);
    if (value && userObj && tokenValue) {
      setUser(userObj);
      setTokenState(tokenValue);
      localStorage.setItem('user', JSON.stringify(userObj));
      localStorage.setItem('token', tokenValue);
    } else {
      setUser(null);
      setTokenState(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, user, token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

