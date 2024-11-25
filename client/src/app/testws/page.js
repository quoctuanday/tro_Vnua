'use client';
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

export default function Home() {
    const [messages, setMessages] = useState([]);
    const [response, setResponse] = useState('');
    const [message, setMessage] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [transport, setTransport] = useState('N/A');
    const socketRef = useRef(null);

    useEffect(() => {
        socketRef.current = io('ws://localhost:8080', { withCredential: true });
        const socket = socketRef.current;

        if (socket.connected) {
            onConnect();
        }

        function onConnect() {
            setIsConnected(true);
            setTransport(socket.io.engine.transport.name || 'N/A');

            socket.io.engine.on('upgrade', (transport) => {
                setTransport(transport.name);
            });
        }

        function onDisconnect() {
            setIsConnected(false);
            setTransport('N/A');
        }

        socket.on('room-update', (data) => {
            setMessages((prevMessages) => [...prevMessages, data]); // Cập nhật danh sách tin nhắn
            console.log('Message from server:', data);
        });

        socket.emit('send_message', 'Hello server');

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('room-update');
        };
    }, []);
    const handleSendMessage = () => {
        if (message.trim()) {
            // Gửi tin nhắn đến server
            socketRef.current.emit('send_message', message);
            socketRef.current.on('room-update', (message) => {
                setResponse(message);
                console.log(message);
            });
            setMessage(''); // Xóa nội dung input sau khi gửi
        }
    };

    return (
        <div>
            <p>Status: {isConnected ? 'connected' : 'disconnected'}</p>
            <p>Transport: {transport}</p>
            <div>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter your message"
                />
                <button onClick={handleSendMessage}>Send Message</button>
                <div className="W-[20rem] h-[20rem] bg-gray-400">
                    {response}
                </div>
            </div>
            <div className="w-[20rem] h-[20rem] bg-gray-400 overflow-y-auto p-2">
                {messages.length > 0 ? (
                    messages.map((msg, index) => (
                        <div key={index} className="mb-2 bg-white p-2 rounded">
                            {typeof msg === 'object'
                                ? JSON.stringify(msg)
                                : msg}
                        </div>
                    ))
                ) : (
                    <p>No messages received</p>
                )}
            </div>
        </div>
    );
}
