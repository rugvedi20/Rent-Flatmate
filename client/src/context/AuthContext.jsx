import { createContext, useContext, useState } from "react";
import authService from "../services/auth.service";
import { storage } from "../utils";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => storage.getUser());

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    storage.setToken(data.token);
    storage.setUser(data.user);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const data = await authService.register(payload);
    storage.setToken(data.token);
    storage.setUser(data.user);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    storage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

