'use client';
import React, { useEffect, useState } from 'react';
import { MdAddBox } from 'react-icons/md';
import PostFindMate from '@/components/postFindMate';
import { useUser } from '@/store/userData';
import { Roommate } from '@/schema/Roommate';
import { getRoommatePersonal } from '@/api/api';
import {
    FaCamera,
    FaSortAmountDown,
    FaSortAmountDownAlt,
    FaSpinner,
    FaTrash,
} from 'react-icons/fa';
import { Toaster } from 'react-hot-toast';
import Currency from '@/utils/convertCurrency';
import Image from 'next/image';
import { FaPencil } from 'react-icons/fa6';
import Link from 'next/link';

function RoommateFinderPage() {
    const { socket } = useUser();
    const [roommates, setRoommates] = useState<Roommate[]>([]);
    const [formVisible, setFormVisible] = useState(false);
    const [reverseSort, setReverseSort] = useState(false);
    const [sortCriterion, setSortCriterion] = useState<
        'name' | 'date' | 'price'
    >('date');
    const [action, setAction] = useState(true);
    const [currentRoommateIndex, setCurrentRoommateIndex] = useState<
        number | null
    >(0);

    useEffect(() => {
        let isMounted = true;
        const getData = async () => {
            const response = await getRoommatePersonal();
            if (isMounted && response) {
                console.log(response.data.roommates);
                setRoommates(response.data.roommates);
            }
        };
        getData();
        if (!socket) return;
        socket.on('roommate-update', () => {
            console.log('roommate-update');
            getData();
        });
        return () => {
            isMounted = false;
        };
    }, [socket]);

    //sort roommate
    const getSortedRoommates = () => {
        const sorted = [...roommates].sort((a, b) => {
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

    const sortedRoommates = getSortedRoommates();

    return (
        <div className="p-[1.3rem] roboto-regular">
            <div className="flex items-center text-[1.3rem]">
                <h1 className="roboto-bold">Tìm bạn ở ghép</h1>
                <div
                    onClick={() => {
                        setFormVisible(true);
                        setAction(true);
                    }}
                >
                    <MdAddBox className="ml-2 hover:text-rootColor " />
                </div>
            </div>
            {action
                ? formVisible &&
                  currentRoommateIndex !== null && (
                      <PostFindMate
                          setFormVisible={setFormVisible}
                          action={true}
                          roommates={roommates}
                          roommateIndex={0}
                      />
                  )
                : formVisible &&
                  currentRoommateIndex !== null && (
                      <PostFindMate
                          setFormVisible={setFormVisible}
                          action={false}
                          roommates={roommates}
                          roommateIndex={currentRoommateIndex}
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
                    <button
                        onClick={() => {
                            setReverseSort(false);
                        }}
                        className="ml-2 hover:text-rootColor cursor-pointer"
                    >
                        <FaSortAmountDown />
                    </button>
                ) : (
                    <button
                        onClick={() => {
                            setReverseSort(true);
                        }}
                        className="ml-2 hover:text-rootColor cursor-pointer"
                    >
                        <FaSortAmountDownAlt />
                    </button>
                )}
                <Link
                    href={'/profile/TrashRoom'}
                    className="block ml-2 hover:text-rootColor"
                >
                    <FaTrash />
                </Link>
            </div>
            <div className="">
                {sortedRoommates ? (
                    <>
                        {sortedRoommates.map((room, index) => (
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
                                                {room.location.name}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="ml-auto">
                                        <button
                                            onClick={() => {
                                                setCurrentRoommateIndex(index);
                                                setFormVisible(true);
                                                setAction(false);
                                            }}
                                            className="px-2 py-1 rounded bg-rootColor hover:bg-[#699ba3c8] text-white"
                                        >
                                            <FaPencil />
                                        </button>
                                        <button
                                            onClick={() => {}}
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

export default RoommateFinderPage;
