'use client';
import { getDeleteRoomPersonal } from '@/api/api';
import React, { useEffect } from 'react';

function TrashRoomPage() {
    useEffect(() => {
        const getData = async () => {
            const response = await getDeleteRoomPersonal();
            if (response) {
                console.log(response.data.rooms);
            }
        };
        getData();
    }, []);
    return (
        <div className="p-[1.3rem] roboto-regular">
            <div className="flex items-center text-[1.3rem]">
                <h1 className="roboto-bold">Thùng rác</h1>
            </div>
        </div>
    );
}

export default TrashRoomPage;
