import { useState } from "react"
import ApiRoute from "../services/api";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("access"));

  const register = async (email: string, password: string) => {
    try {
      await ApiRoute.register(email, password);
      return true;
    } catch (error) {
      console.log("User Registration failed: ", error);
      return false;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await ApiRoute.login(email, password);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.log("User Login failed: ", error);
      return false;
    }
  };

  const logout = () => {
    ApiRoute.logout();
    setIsAuthenticated(false);
  };

  return { isAuthenticated, login, register, logout };
}
