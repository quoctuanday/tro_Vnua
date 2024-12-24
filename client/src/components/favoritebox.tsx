'use client';
import { getFavourites, getFavouritesRoommate } from '@/api/api';
import { Room } from '@/schema/room';
import Currency from '@/utils/convertCurrency';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
interface Props {
    setIsFavouriteBox: React.Dispatch<React.SetStateAction<boolean>>;
}

const FavoriteBox: React.FC<Props> = ({ setIsFavouriteBox }) => {
    const [type, setType] = useState(true);
    const [rooms, setRooms] = useState<Room[]>([]);
    useEffect(() => {
        if (type) {
            const getData = async () => {
                const response = await getFavourites();
                if (response) {
                    setRooms(response.data.rooms);
                }
            };
            getData();
        } else {
            const getData = async () => {
                const response = await getFavouritesRoommate();
                if (response) {
                    setRooms(response.data.rooms);
                }
            };
            getData();
        }
    }, [type]);
    return (
        <div className="">
            <div className="grid grid-cols-2">
                <button
                    onClick={() => {
                        setType(true);
                    }}
                    className={`col-span-1 px-2 py-1 roboto-bold rounded-tl ${
                        type && 'bg-rootColor text-white'
                    }`}
                >
                    Phòng trọ
                </button>
                <button
                    onClick={() => {
                        setType(false);
                    }}
                    className={`col-span-1 px-2 py-1 roboto-bold rounded-tr ${
                        type ? '' : 'bg-rootColor text-white'
                    }`}
                >
                    Bạn ở ghép
                </button>
            </div>
            <div>
                {type ? (
                    <div className='min-h-[15rem]'>
                        {rooms.length > 0 ? (
                            <div className="">
                                {rooms.map((room) => (
                                    <Link
                                        href={`/rooms/${room._id}`}
                                        onClick={() => {
                                            setIsFavouriteBox(false);
                                        }}
                                        className="block px-1 hover:bg-[#eae9e9]"
                                        key={room._id}
                                    >
                                        <div className="grid grid-cols-4 gap-1 py-1">
                                            <Image
                                                src={room.images[0]}
                                                alt=""
                                                width={100}
                                                height={100}
                                                className=" col-span-1 w-full h-[5rem] rounded"
                                            ></Image>
                                            <div className="col-span-3 flex flex-col justify-between">
                                                <h1 className="roboto-bold line-clamp-1">
                                                    {room.title}
                                                </h1>
                                                <span>
                                                    Giá:{' '}
                                                    {Currency(
                                                        room.price,
                                                        'vi-VN'
                                                    )}{' '}
                                                    triệu/tháng
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center roboto-regular text-red-500">
                                Chưa có phòng nào được thêm vào.
                            </div>
                        )}
                    </div>
                ) : (
                    <div className='min-h-[15rem]'>
                        {rooms.length > 0 ? (
                            <div className="">
                                {rooms.map((room) => (
                                    <Link
                                        href={`/rooms/${room._id}`}
                                        onClick={() => {
                                            setIsFavouriteBox(false);
                                        }}
                                        className="block px-1 hover:bg-[#eae9e9]"
                                        key={room._id}
                                    >
                                        <div className="grid grid-cols-4 gap-1 py-1">
                                            <Image
                                                src={room.images[0]}
                                                alt=""
                                                width={100}
                                                height={100}
                                                className=" col-span-1 w-full h-[5rem] rounded"
                                            ></Image>
                                            <div className="col-span-3 flex flex-col justify-between">
                                                <h1 className="roboto-bold line-clamp-1">
                                                    {room.title}
                                                </h1>
                                                <span>
                                                    Giá:{' '}
                                                    {Currency(
                                                        room.price,
                                                        'vi-VN'
                                                    )}{' '}
                                                    triệu/tháng
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center roboto-regular text-red-500">
                                Chưa có phòng nào được thêm vào.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FavoriteBox;
