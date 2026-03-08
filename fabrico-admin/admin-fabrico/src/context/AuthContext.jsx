import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

/** Wrap your whole app in <AuthProvider> so any page can read/write the admin */
export function AuthProvider({ children }) {
    const [admin, setAdmin] = useState(() => {
        // Initialize admin from localStorage if available
        const savedAdmin = localStorage.getItem('admin');
        return savedAdmin ? JSON.parse(savedAdmin) : null;
    });

    // Update localStorage whenever admin changes
    useEffect(() => {
        if (admin) {
            localStorage.setItem('admin', JSON.stringify(admin));
        } else {
            localStorage.removeItem('admin');
        }
    }, [admin]);

    return (
        <AuthContext.Provider value={{ admin, setAdmin }}>
            {children}
        </AuthContext.Provider>
    );
}

/** Hook to access admin & setter */
export function useAuth() {
    return useContext(AuthContext);
}