import { useState } from "react"
import ApiRoute from "../services/api";

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("access"));

    const register = async (email: string, password: string) => {
        const result = await ApiRoute.register(email, password);
        if (!result.ok) {
            console.error(result.error);
            return false;
        }
        return true;
    };

    const login = async (email: string, password: string): Promise<boolean> => {
        const result = await ApiRoute.login(email, password);
        if (!result.ok) {
            console.error(result.error);
            return false
        }
        setIsAuthenticated(true);
        return true;
    };

    const logout = () => {
        ApiRoute.logout();
        setIsAuthenticated(false);
    };

    return { isAuthenticated, login, register, logout };
}
