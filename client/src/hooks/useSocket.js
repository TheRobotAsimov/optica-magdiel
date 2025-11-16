import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const useSocket = () => {
    const { user } = useAuth();
    const socketRef = useRef(null);

    useEffect(() => {
        if (user && !socketRef.current) {
            // Obtener token del localStorage o cookies
            const token = localStorage.getItem('token') || document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];

            socketRef.current = io('/', {
                auth: {
                    token: token
                }
            });

            socketRef.current.on('connect', () => {
                console.log('Conectado al servidor de sockets');
            });

            socketRef.current.on('disconnect', () => {
                console.log('Desconectado del servidor de sockets');
            });
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [user]);

    return socketRef.current;
};

export default useSocket;