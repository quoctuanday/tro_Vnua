'use client';
import { getAllRooms, getCategory } from '@/api/api';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { FaCamera, FaRegStar, FaStar, FaStarHalfAlt } from 'react-icons/fa';
import { Room } from '@/schema/room';
import { IoSearch } from 'react-icons/io5';
import { Category } from '@/schema/Category';
import { MdKeyboardArrowRight } from 'react-icons/md';
import Currency from '@/utils/convertCurrency';
import Link from 'next/link';
import dateConvert from '@/utils/convertDate';

function ListRoomPage() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [category, setCategory] = useState<Category[]>([]);
    const [numberOfRoom, setNumberOfRoom] = useState(0);
    const [typeSort, setTypeSort] = useState<'Đề xuất' | 'Mới nhất'>('Đề xuất');

    useEffect(() => {
        const getRooms = async () => {
            const response = await getAllRooms();
            if (response) {
                const data = response.data.formattedRooms;
                const availableRooms = data.filter(
                    (room: Room) => room.isAvailable
                );
                console.log(availableRooms.length);
                setNumberOfRoom(availableRooms.length);

                setRooms(availableRooms);
            }
        };
        const getCategories = async () => {
            const response = await getCategory();
            if (response) {
                const data = response.data.category;
                setCategory(data);
            }
        };
        getRooms();
        getCategories();
    }, []);

    return (
        <div className="pt-6">
            <div className="grid grid-cols-3 gap-8">
                <div className="col-span-2">
                    <h1 className="roboto-bold text-[1.3rem]">
                        Cho thuê phòng trọ
                    </h1>
                    <span className="">
                        Có {numberOfRoom} tin đăng cho thuê.
                    </span>
                    <div className="relative mt-[1rem]">
                        <input
                            placeholder="Tìm kiếm"
                            className="rounded-[10px] w-full border-2 px-2 py-1 outline-none"
                            type="text"
                        />
                        <button className="absolute top-0 bottom-0 right-0 px-2 py-1 bg-rootColor text-white rounded-r-[10px]">
                            <IoSearch />
                        </button>
                    </div>
                    <div className="mt-3">
                        <div className="flex">
                            <button
                                onClick={() => setTypeSort('Đề xuất')}
                                className={`${
                                    typeSort === 'Đề xuất' &&
                                    'roboto-bold border-b-[3px] border-black'
                                }`}
                            >
                                Đề xuất
                            </button>
                            <button
                                onClick={() => setTypeSort('Mới nhất')}
                                className={`ml-3 ${
                                    typeSort === 'Mới nhất' &&
                                    'roboto-bold border-b-[3px] border-black'
                                }`}
                            >
                                Mới đăng
                            </button>
                        </div>
                    </div>
                    <div className="mt-3">
                        {rooms.map((room) => {
                            const images = room.images.slice(0, 4);
                            return (
                                <div
                                    className="bg-white p-4 first:mt-0 mt-3 rounded shadow-custom-light grid grid-rows-3"
                                    key={room._id}
                                >
                                    <div className="relative row-span-2 overflow-hidden grid h-full max-h-[300px] grid-cols-2 grid-rows-2 rounded">
                                        {Array.isArray(images) &&
                                            images.map((image, index) => (
                                                <div
                                                    className="w-full h-full border-2 border-white"
                                                    key={index}
                                                >
                                                    <Image
                                                        src={image}
                                                        alt=""
                                                        width={200}
                                                        height={200}
                                                        className="w-full h-full object-cover"
                                                    ></Image>
                                                </div>
                                            ))}
                                        <div className="absolute left-[1%] bottom-[2%] p-1 bg-black opacity-50 text-white rounded flex items-center">
                                            <FaCamera />
                                            <span className="ml-1">
                                                {room.images.length}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="row-span-1 ">
                                        <Link
                                            href={`/rooms/${room._id}`}
                                            className="mt-2 roboto-bold text-[1.2rem] hover:underline text-blue-500 "
                                        >
                                            {room.title}
                                        </Link>
                                        <div className="flex items-center mt-1">
                                            {Array.from({ length: 5 }).map(
                                                (_, index) => {
                                                    if (
                                                        index <
                                                        Math.floor(
                                                            room.rate || 0
                                                        )
                                                    ) {
                                                        return (
                                                            <FaStar
                                                                key={index}
                                                                className="text-yellow-500 text-[1rem] mr-1"
                                                            />
                                                        );
                                                    } else if (
                                                        index <
                                                            Math.floor(
                                                                room.rate || 0
                                                            ) +
                                                                1 &&
                                                        room.rate % 1 >= 0.5
                                                    ) {
                                                        return (
                                                            <FaStarHalfAlt
                                                                key={index}
                                                                className="text-yellow-500 text-[1rem] mr-1"
                                                            />
                                                        );
                                                    } else {
                                                        return (
                                                            <FaRegStar
                                                                key={index}
                                                                className="text-gray-400 text-[1rem] mr-1"
                                                            />
                                                        );
                                                    }
                                                }
                                            )}
                                        </div>
                                        <div className="flex">
                                            <span className="text-rootColor roboto-bold">
                                                {Currency(room.price, 'vi-VN')}
                                                /tháng
                                            </span>
                                            <span className="ml-2">
                                                {room.acreage}m&sup2;{' '}
                                            </span>
                                        </div>
                                        <p className="mt-1  line-clamp-2 w-full">
                                            {room.description}
                                        </p>
                                        <span className="line-clamp-1 roboto-bold">
                                            Địa chỉ: {room.location.name}
                                        </span>
                                        <span>
                                            Ngày đăng{' '}
                                            {dateConvert(room.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="col-span-1">
                    <div className="p-2 rounded  bg-white shadow-custom-light">
                        {category.map((category) => (
                            <div className="first:mt-0 mt-3" key={category._id}>
                                <h1 className="roboto-bold">{category.name}</h1>
                                <div className="grid grid-cols-2">
                                    {category.child.map((child) => {
                                        const updatedChildName =
                                            child.name.replace(/m2/g, 'm²');

                                        return (
                                            <div
                                                className="col-span-1 hover:text-rootColor cursor-pointer "
                                                key={child._id}
                                            >
                                                <div className="flex items-center text-[1rem]">
                                                    <MdKeyboardArrowRight />
                                                    <span>
                                                        {updatedChildName}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ListRoomPage;
