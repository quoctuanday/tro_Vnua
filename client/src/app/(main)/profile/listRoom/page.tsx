'use client';
import { deleteRoomPersonal, getRoomsPersonal } from '@/api/api';
import PostRoom from '@/components/PostRoom';
import { Room } from '@/schema/room';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import {
    FaCamera,
    FaSortAmountDown,
    FaSortAmountDownAlt,
    FaSpinner,
    FaTrash,
} from 'react-icons/fa';
import { MdAddBox } from 'react-icons/md';
import Currency from '../../../../utils/convertCurrency';
import useWebSocket from '../../../../utils/websocket';
import { FaPencil } from 'react-icons/fa6';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import EditRoom from '@/components/editRoom';

function ListRoomPage() {
    const socketUrl = 'ws://localhost:8000';
    const [rooms, setRooms] = useState<Room[]>([]);
    const [formVisible, setFormVisible] = useState(false);
    const [reverseSort, setReverseSort] = useState(false);
    const [sortCriterion, setSortCriterion] = useState<
        'name' | 'date' | 'price'
    >('date');
    const [currentRoomIndex, setCurrentRoomIndex] = useState<number | null>(
        null
    );
    const [editForm, setEditForm] = useState(false);

    useWebSocket(socketUrl, setRooms);
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

    //Sort rooms
    const getSortedRooms = () => {
        const sorted = [...rooms].sort((a, b) => {
            switch (sortCriterion) {
                case 'name':
                    return a.title.localeCompare(b.title);
                case 'date':
                    return (
                        new Date(b.createdAt ?? 0).getTime() -
                        new Date(a.createdAt ?? 0).getTime()
                    );
                case 'price':
                    return a.price - b.price;
                default:
                    return 0;
            }
        });

        if (reverseSort) {
            return sorted.reverse();
        }

        return sorted;
    };

    const sortedRooms = getSortedRooms();

    const deleteRoom = (roomId: string) => {
        console.log('delete room:', roomId);
        const deleteData = async () => {
            const response = await deleteRoomPersonal(roomId);
            if (response) {
                toast.success('Xoá phòng thành công!');
                setRooms(rooms.filter((room) => room._id !== roomId));
            } else {
                toast.success('Xoá phòng thất bại');
            }
        };
        deleteData();
    };
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
            {editForm && currentRoomIndex !== null && (
                <EditRoom
                    rooms={sortedRooms}
                    roomIndex={currentRoomIndex}
                    setEditForm={setEditForm}
                />
            )}
            <div className="mt-1 flex items-center justify-end">
                <select
                    name=""
                    id=""
                    onChange={(e) =>
                        setSortCriterion(
                            e.target.value as 'name' | 'date' | 'price'
                        )
                    }
                    className="rounded border-2 outline-none px-2 py-1"
                >
                    <option value="date">Sắp xếp theo ngày đăng</option>
                    <option value="price">Sắp xếp theo giá</option>
                    <option value="name">Sắp xếp theo tên</option>
                </select>
                {reverseSort ? (
                    <FaSortAmountDown
                        className="ml-2 hover:text-rootColor cursor-pointer"
                        onClick={() => {
                            setReverseSort(false);
                        }}
                    />
                ) : (
                    <FaSortAmountDownAlt
                        className="ml-2 hover:text-rootColor cursor-pointer"
                        onClick={() => {
                            setReverseSort(true);
                        }}
                    />
                )}
                <Link
                    href={'/profile/TrashRoom'}
                    className="block ml-2 hover:text-rootColor"
                >
                    <FaTrash />
                </Link>
            </div>
            <div className="">
                {sortedRooms ? (
                    <>
                        {sortedRooms.map((room, index) => (
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
                                        <button
                                            onClick={() => {
                                                setCurrentRoomIndex(index);
                                                setEditForm(true);
                                            }}
                                            className="px-2 py-1 rounded bg-rootColor hover:bg-[#699ba3c8] text-white"
                                        >
                                            <FaPencil />
                                        </button>
                                        <button
                                            onClick={() => deleteRoom(room._id)}
                                            className="px-2 py-1 rounded ml-2 bg-red-500 hover:bg-[#ef4444cb] text-white"
                                        >
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
            <Toaster position="top-right" />
        </div>
    );
}

export default ListRoomPage;
