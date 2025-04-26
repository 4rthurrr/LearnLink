import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        const loadUser = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const res = await authService.getCurrentUser();
                    setUser(res.data);
                }
            } catch (error) {
                console.error("Failed to load user", error);
                localStorage.removeItem('token');
            } finally {
                setLoading(false);
            }
        };
        
        loadUser();
    }, []);
    
    const login = async (provider) => {
        try {
            window.location.href = `/oauth2/authorize/${provider}`;
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred during login');
            throw err;
        }
    };
    
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };
    
    return (
        <AuthContext.Provider value={{ user, loading, error, login, logout, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};
