'use client';
import { getRoomsPersonal } from '@/api/api';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { FaCamera, FaSortAmountDown, FaSortAmountDownAlt, FaSpinner } from 'react-icons/fa';
import Link from 'next/link';

import { Room } from '@/schema/room';

function ListRoomPage() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [reverseSort, setReverseSort] = useState(false);
    const [sortCriterion, setSortCriterion] = useState<'name' | 'date' | 'price'>('date');
    const [loading, setLoading] = useState(true);

    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);

        const getData = async () => {
            const response = await getRoomsPersonal();
            if (response) {
                setRooms(response.data.rooms);
            }
            setLoading(false); 
        };
        getData();
    }, []);

    // Hàm định dạng tiền
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    // Sắp xếp các phòng
    const getSortedRooms = () => {
        const sorted = [...rooms].sort((a, b) => {
            switch (sortCriterion) {
                case 'name':
                    return a.title.localeCompare(b.title);
                case 'date':
                    if (isClient) {
                        return (
                            new Date(b.createdAt ?? 0).getTime() -
                            new Date(a.createdAt ?? 0).getTime()
                        );
                    }
                    return 0;
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

    return (
        <div className="p-[1.3rem] roboto-regular">
            <div className="flex items-center text-[1.3rem]">
                <h1 className="roboto-bold">Danh sách phòng</h1>
            </div>

            <div className="mt-1 flex items-center justify-end">
                <select
                    name=""
                    id=""
                    onChange={(e) =>
                        setSortCriterion(e.target.value as 'name' | 'date' | 'price')
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
            </div>

            <div>
                {loading ? (
                    <div className="flex items-center justify-center">
                        <FaSpinner className="spin" />
                    </div>
                ) : (
                    <>
                        {sortedRooms.map((room, index) => (
                            <div className="mt-3 cursor-pointer" key={index}>
                                <Link href={`/rooms/${room._id}`} passHref>
                                    <div className="relative flex items-center">
                                        <Image
                                            src={
                                                room.images && room.images[0]
                                                    ? room.images[0]
                                                    : '/path/to/default-image.jpg'
                                            }
                                            alt="Room Image"
                                            width={100}
                                            height={100}
                                            className="w-[6rem] h-[6rem] rounded-[10px]"
                                        />
                                        <div className="absolute px-1 py-1 bg-[#333] opacity-40 bottom-[5%] left-[0.6rem] text-white flex items-center justify-center rounded min-w-[1.5rem] h-[1.2rem]">
                                            <FaCamera />
                                            <p className="ml-2">{Array.isArray(room.images) ? room.images.length : 1}</p>
                                        </div>
                                        <div className="ml-2 flex flex-col justify-between max-w-[26.8rem] h-full">
                                            <div className="roboto-bold max-w-[26.8rem] max_line_1 ">
                                                {room.title}
                                            </div>
                                            <div className="max_line_2 ">{room.description}</div>
                                            <div className="flex items-center text-rootColor">
                                                <div className="roboto-bold">
                                                    {formatCurrency(room.price)} /tháng
                                                </div>
                                                <div className="ml-2 max_line_1 ">{room.location.name}</div>
                                                <div className="ml-2 text-[0.9rem]">
                                                    {isClient && room.createdAt
                                                        ? new Date(room.createdAt).toLocaleDateString('vi-VN')
                                                        : 'Đang tải'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}

export default ListRoomPage;
