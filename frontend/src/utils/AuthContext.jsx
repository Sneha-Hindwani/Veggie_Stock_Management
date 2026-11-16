import { createContext, useContext, useState } from 'react';
import { apiAuthPost, setAuthToken, removeAuthToken, validateUser, registerUser } from './data';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin@123';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [isLoggedIn, setIsLoggedIn] = useState(() => sessionStorage.getItem('isLoggedIn') === 'true');
    const [isAdmin, setIsAdmin] = useState(() => sessionStorage.getItem('isAdmin') === 'true');
    const [username, setUsername] = useState(() => sessionStorage.getItem('username') || '');

    const login = async (user, pass) => {
        try {
            const authResult = await apiAuthPost('login', { username: user, password: pass });
            setAuthToken(authResult.token);
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('isAdmin', authResult.isAdmin ? 'true' : 'false');
            sessionStorage.setItem('username', authResult.username);
            sessionStorage.setItem('loginTime', new Date().toISOString());
            setIsLoggedIn(true);
            setIsAdmin(authResult.isAdmin);
            setUsername(authResult.username);
            return { success: true, isAdmin: authResult.isAdmin };
        } catch (error) {
            // Offline/admin fallback when backend auth fails.
            if (user === ADMIN_USERNAME && pass === ADMIN_PASSWORD) {
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('isAdmin', 'true');
                sessionStorage.setItem('username', ADMIN_USERNAME);
                sessionStorage.setItem('loginTime', new Date().toISOString());
                setIsLoggedIn(true);
                setIsAdmin(true);
                setUsername(ADMIN_USERNAME);
                return { success: true, isAdmin: true };
            }

            // Fallback to localStorage auth
            if (validateUser(user, pass)) {
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('isAdmin', 'false');
                sessionStorage.setItem('username', user);
                sessionStorage.setItem('loginTime', new Date().toISOString());
                setIsLoggedIn(true);
                setIsAdmin(false);
                setUsername(user);
                return { success: true, isAdmin: false };
            }
            return { success: false, message: error.message || 'Invalid username or password.' };
        }
    };

    const signup = async (user, pass) => {
        try {
            const result = await apiAuthPost('register', { username: user, password: pass });
            setAuthToken(result.token);
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('isAdmin', result.isAdmin ? 'true' : 'false');
            sessionStorage.setItem('username', result.username);
            sessionStorage.setItem('loginTime', new Date().toISOString());
            setIsLoggedIn(true);
            setIsAdmin(result.isAdmin);
            setUsername(result.username);
            return { success: true };
        } catch (error) {
            const result = registerUser(user, pass);
            if (result.success) {
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('isAdmin', 'false');
                sessionStorage.setItem('username', user);
                sessionStorage.setItem('loginTime', new Date().toISOString());
                setIsLoggedIn(true);
                setIsAdmin(false);
                setUsername(user);
                return { success: true };
            }
            return { success: false, message: result.message || error.message };
        }
    };

    const logout = () => {
        sessionStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('isAdmin');
        sessionStorage.removeItem('username');
        sessionStorage.removeItem('loginTime');
        removeAuthToken();
        setIsLoggedIn(false);
        setIsAdmin(false);
        setUsername('');
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, isAdmin, username, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
