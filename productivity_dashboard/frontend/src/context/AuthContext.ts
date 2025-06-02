import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as authLogin, logout as authLogout, checkAuth } from '../services/authService';

interface AuthContextType {
    isAuthenticated: boolean;
    user: {username: string, email: string} | null;
    login: (credentials: {username: string, password: string}) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType |undefined>(undefined);

export const AuthProvider = ({children}: {children: ReactNode }) => {
    const [user, setUser] = useState<{username: string, email: string} | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const userData = await checkAuth();
                setIsAuthenticated(true);
                setUser({
                    username: userData.username,
                    email: userData.email
                });
            } catch {
                setIsAuthenticated(false);
                setUser(null);
            }finally{
                setLoading(false)
            }
        }
        verifyAuth()
    }, [])

    const login = async (credentials: {username: string, password: string}) => {
        setLoading(true);
        try {
            const userData = await authLogin(credentials)
            setIsAuthenticated(true);
            setUser({
                username: userData.username,
                email: userData.email
            });
        } catch (error) {
            setIsAuthenticated(false);
            setUser(null)
            throw error;
        } finally {
            setLoading(false)
        }
    }

    const logout = async () => {
        setLoading(true)
        try{
            authLogout()
            setIsAuthenticated(false)
            setUser(null)
        }catch (error) {
            console.log('Logout Failed:', error)
        } finally {
            setLoading(false)
        }
    }
    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
        {children}
        </AuthContext.Provider>
    );
    };
export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined ) {
        throw new Error('useAuth must be within an AuthProvider')
    }
    return context;
}

