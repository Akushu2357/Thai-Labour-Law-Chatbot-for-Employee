import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY);

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const init = async () => {
            setLoading(true);
            try {
                const { data } = await supabase.auth.getSession();
                if (data?.session) {
                    const s = data.session;
                    if (!mounted) return;
                    setSession(s);
                    setUser(s.user);
                    setIsAuthenticated(true);
                    localStorage.setItem('auth_user', JSON.stringify({ user: s.user, token: s.access_token }));
                }
            } catch (err) {
                console.warn('Error fetching session', err);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        init();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
            if (s) {
                setSession(s);
                setUser(s.user);
                setIsAuthenticated(true);
                localStorage.setItem('auth_user', JSON.stringify({ user: s.user, token: s.access_token }));
            } else {
                setSession(null);
                setUser(null);
                setIsAuthenticated(false);
                localStorage.removeItem('auth_user');
            }
        });

        return () => {
            mounted = false;
            subscription?.unsubscribe();
        };
    }, []);

    const signUp = async ({ email, password }) => {
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({ email, password });
            if (error) throw error;
            return data;
        } catch (err) {
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const signIn = async ({ email, password }) => {
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            if (data?.session) {
                setSession(data.session);
                setUser(data.session.user);
                setIsAuthenticated(true);
                localStorage.setItem('auth_user', JSON.stringify({ user: data.session.user, token: data.session.access_token }));
            }
            return data;
        } catch (err) {
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const signInWithGoogle = async () => {
        return supabase.auth.signInWithOAuth({ provider: 'google' });
    };

    const logout = async () => {
        try {
            await supabase.auth.signOut();
        } catch (err) {
            console.warn('Error signing out', err);
        }
        localStorage.removeItem('auth_user');
        setUser(null);
        setSession(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, session, loading, signUp, signIn, signInWithGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}

export default AuthContext;
