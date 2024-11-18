import { useEffect, useRef } from 'react';

function useWebSocket(url, setData) {
    const isMounted = useRef(true);

    useEffect(() => {
        const socket = new WebSocket(url);

        socket.onopen = () => {
            console.log('WebSocket connected');
            socket.send(JSON.stringify({ message: 'Hello, Server!' }));
        };

        socket.onmessage = (event) => {
            if (isMounted.current) {
                try {
                    const data = JSON.parse(event.data);
                    if (data.event === 'update') {
                        setData((prevData) => {
                            const updateData = data.data;
                            return prevData.map((data) =>
                                data._id === updateData._id ? updateData : data
                            );
                        });
                    } else if (data.event === 'delete') {
                        setData((prevData) =>
                            prevData.filter(
                                (data) => data._id !== data.data._id
                            )
                        );
                    }
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            }
        };

        socket.onclose = () => {
            console.log('WebSocket disconnected');
        };

        return () => {
            isMounted.current = false;
            socket.close();
        };
    }, [url, setData]);

    return null;
}

export default useWebSocket;
