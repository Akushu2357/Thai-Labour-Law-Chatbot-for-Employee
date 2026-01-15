import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem('auth_user');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setUser(parsed.user || null);
                setIsAuthenticated(!!parsed.token);
            } catch (e) {
                localStorage.removeItem('auth_user');
            }
        }
    }, []);

    const login = ({ email, token = 'fake-token' }) => {
        const payload = { user: { email }, token };
        localStorage.setItem('auth_user', JSON.stringify(payload));
        setUser(payload.user);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('auth_user');
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}

export default AuthContext;
