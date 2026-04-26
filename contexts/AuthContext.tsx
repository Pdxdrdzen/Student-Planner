// contexts/AuthContext.tsx
import React, { createContext, useContext, useState } from 'react';

type User = {
    name: string;
    email: string;
} | null;

type AuthContextType = {
    user: User;
    login: (u: User) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User>(null);

    return (
        <AuthContext.Provider
            value={{
                user,
                login: (u) => setUser(u),
                logout: () => setUser(null),
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);