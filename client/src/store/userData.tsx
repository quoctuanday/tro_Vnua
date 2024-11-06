'use client';
import { User } from '@/schema/user';
import { createContext, useContext, useEffect, useState } from 'react';

interface UserContextProps {
    userLoginData: User | null;
    setUserLoginData: (user: User | null) => void;
}
const UserContext = createContext<UserContextProps | undefined>(undefined);

export default function Provider({ children }: { children: React.ReactNode }) {
    const [userLoginData, setUserLoginData] = useState<User | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('userLoginData');
        if (storedUser) {
            setUserLoginData(JSON.parse(storedUser));
        }
    }, []);

    return (
        <UserContext.Provider value={{ userLoginData, setUserLoginData }}>
            {children}
        </UserContext.Provider>
    );
}

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
