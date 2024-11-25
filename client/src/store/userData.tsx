'use client';
import { User } from '@/schema/user';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UserContextProps {
    userLoginData: User | null;
    setUserLoginData: (user: User | null) => void;
    socket: Socket | null;
}
const UserContext = createContext<UserContextProps | undefined>(undefined);

export default function Provider({ children }: { children: React.ReactNode }) {
    const [userLoginData, setUserLoginData] = useState<User | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('userLoginData');
        if (storedUser) {
            setUserLoginData(JSON.parse(storedUser));
        }
        const socketInstance = io('ws://localhost:8080', {
            withCredentials: true,
        });
        socketRef.current = socketInstance;
        setSocket(socketInstance);

        // Xử lý sự kiện kết nối và ngắt kết nối
        socketInstance.on('connect', () => {
            console.log('Socket connected:', socketInstance.id);
        });

        socketInstance.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    return (
        <UserContext.Provider
            value={{ userLoginData, setUserLoginData, socket }}
        >
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
