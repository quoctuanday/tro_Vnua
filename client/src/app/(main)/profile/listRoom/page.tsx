'use client';
import { getRoomsPersonal } from '@/api/api';
import PostRoom from '@/components/PostRoom';
import { Room } from '@/schema/room';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { FaCamera, FaSpinner, FaTrash } from 'react-icons/fa';
import { MdAddBox } from 'react-icons/md';
import Currency from '../../../../helper/convertCurrency';
import { FaPencil } from 'react-icons/fa6';

function ListRoomPage() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [formVisible, setFormVisible] = useState(false);
    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            const response = await getRoomsPersonal();
            if (isMounted && response) {
                console.log(response.data.rooms);
                setRooms(response.data.rooms);
            }
        };
        fetchData();
        return () => {
            isMounted = false;
        };
    }, []);
    return (
        <div className="p-[1.3rem] roboto-regular">
            <div className="flex items-center text-[1.3rem]">
                <h1 className="roboto-bold">Bài đăng cho thuê</h1>
                <div
                    onClick={() => {
                        setFormVisible(true);
                    }}
                >
                    <MdAddBox className="ml-2 hover:text-rootColor " />
                </div>
            </div>
            {formVisible && <PostRoom setFormVisible={setFormVisible} />}
            <div className="">
                {rooms ? (
                    <>
                        {rooms.map((room, index) => (
                            <div className="mt-3 cursor-pointer" key={index}>
                                <div className="relative flex items-center">
                                    <Image
                                        src={`${room.images[0]}`}
                                        alt=""
                                        width={100}
                                        height={100}
                                        className="w-[6rem] h-[6rem] rounded-[10px]"
                                    ></Image>
                                    <div className="absolute px-1 py-1 bg-[#333] opacity-40 bottom-[5%] left-[0.6rem] text-white flex items-center justify-center rounded min-w-[1.5rem] h-[1.2rem]">
                                        <FaCamera />
                                        <p className="ml-2">
                                            {room.images.length}
                                        </p>
                                    </div>
                                    <div className="ml-2 flex flex-col justify-between max-w-[26.8rem] h-full">
                                        <div className="roboto-bold max-w-[26.8rem] max_line_1 ">
                                            {room.title}
                                        </div>
                                        <div className="max_line_2 ">
                                            {room.description}
                                        </div>
                                        <div className="flex items-center text-rootColor">
                                            <div className="roboto-bold">
                                                {Currency(room.price, 'vi-VN')}
                                                /tháng{' '}
                                            </div>
                                            <div className="ml-2 max_line_1 ">
                                                {room.location}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="ml-auto">
                                        <button className="px-2 py-1 rounded bg-rootColor hover:bg-[#699ba3c8] text-white">
                                            <FaPencil />
                                        </button>
                                        <button className="px-2 py-1 rounded ml-2 bg-red-500 hover:bg-[#ef4444cb] text-white">
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    <>
                        <div className="flex items-center justify-center">
                            <FaSpinner className="spin" />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default ListRoomPage;
