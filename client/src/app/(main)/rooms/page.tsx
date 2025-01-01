'use client';
import {
    addFavourite,
    getAllRooms,
    getCategory,
    getFavourites,
    removeFavourite,
} from '@/api/api';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import {
    FaCamera,
    FaHeart,
    FaRegHeart,
    FaRegStar,
    FaStar,
    FaStarHalfAlt,
} from 'react-icons/fa';
import { Room } from '@/schema/room';
import { IoSearch } from 'react-icons/io5';
import { Category } from '@/schema/Category';
import { MdKeyboardArrowRight } from 'react-icons/md';
import Currency from '@/utils/convertCurrency';
import formatTimeDifference from '@/utils/formatTime';
import Link from 'next/link';
import Pagination from '@/components/pagination';
import { useUser } from '@/store/userData';
import dateConvert from '@/utils/convertDate';

function ListRoomPage() {
    const { socket } = useUser();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [filterRooms, setFilterRooms] = useState<Room[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [categories, setCategories] = useState<Category[]>([]);
    const [listRoomId, setListRoomId] = useState<string[]>([]);
    const [listChildCate, setListChildCate] = useState<string[]>([]);
    const [numberOfRoom, setNumberOfRoom] = useState(0);
    const [typeSort, setTypeSort] = useState<'Đề xuất' | 'Mới nhất'>('Đề xuất');
    const [isFavourite, setIsFavourite] = useState<string[]>([]);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const getRooms = async () => {
            const response = await getAllRooms();
            if (response) {
                const data = response.data.formattedRooms;
                const availableRooms = data.filter(
                    (room: Room) => room.isAvailable && room.isCheckout
                );

                availableRooms.sort((a: Room, b: Room) => b.rate - a.rate);
                setNumberOfRoom(availableRooms.length);

                setRooms(availableRooms);
                setFilterRooms(availableRooms);
            }
        };
        const getFavouriteRooms = async () => {
            const response = await getFavourites();
            if (response) {
                const data = response.data.roomIds;
                console.log(data);
                setIsFavourite(data);
            }
        };
        const getCategories = async () => {
            const response = await getCategory();
            if (response) {
                const data = response.data.category;
                setCategories(data);
            }
        };
        getRooms();
        getFavouriteRooms();
        getCategories();
        if (!socket) return;
        socket.on('roomFavourite-update', () => {
            console.log('update favourite');
            getFavouriteRooms();
        });
        socket.on('category-update', () => {
            getCategories();
        });
        socket.on('room-update', () => {
            getRooms();
        });
    }, [socket]);

    const handleFavourite = async (roomId: string) => {
        if (isFavourite.includes(roomId)) {
            await removeFavourite(roomId);
        } else {
            await addFavourite(roomId);
        }
    };
    const handleSearch = () => {
        const searchResults = rooms.filter((room) => {
            if (!room.title) return;
            if (!searchInputRef.current) return;
            const value = searchInputRef.current.value;
            const matchTitle = room.title
                .toLowerCase()
                .includes(value.toLowerCase());

            return matchTitle;
        });
        console.log(searchResults);
        if (searchResults.length > 0) {
            setCurrentPage(1);
            setFilterRooms(searchResults);
        } else {
            setFilterRooms([]);
        }
        if (!searchInputRef.current) return;
        searchInputRef.current.value = '';
    };

    const roomsPerPage = 5;
    const totalRooms = filterRooms.length;
    const totalPages = Math.ceil(totalRooms / roomsPerPage);
    const startIndex = (currentPage - 1) * roomsPerPage;
    const endIndex = startIndex + roomsPerPage;
    const currentRooms = filterRooms.slice(startIndex, endIndex);

    return (
        <div className="pt-6">
            <div className="grid grid-cols-3 gap-8">
                <div className="col-span-2">
                    <h1 className="roboto-bold text-[1.3rem]">
                        Phòng cho thuê
                    </h1>
                    <span className="">
                        Có {numberOfRoom} tin đăng cho thuê.
                    </span>
                    <div className="relative mt-[1rem]">
                        <input
                            ref={searchInputRef}
                            placeholder="Tìm kiếm"
                            className="rounded-[10px] w-full border-2 px-2 py-1 outline-none"
                            type="text"
                        />
                        <button
                            onClick={() => handleSearch()}
                            className="absolute top-0 bottom-0 right-0 px-2 py-1 bg-rootColor text-white rounded-r-[10px]"
                        >
                            <IoSearch />
                        </button>
                    </div>
                    <div className="mt-3">
                        <div className="flex">
                            <button
                                onClick={() => {
                                    setTypeSort('Đề xuất');
                                    setFilterRooms(
                                        rooms.sort(
                                            (a: Room, b: Room) =>
                                                b.rate - a.rate
                                        )
                                    );
                                }}
                                className={`${
                                    typeSort === 'Đề xuất' &&
                                    'roboto-bold border-b-[3px] border-black'
                                }`}
                            >
                                Đề xuất
                            </button>
                            <button
                                onClick={() => {
                                    setTypeSort('Mới nhất');
                                    setFilterRooms(
                                        rooms.sort(
                                            (a: Room, b: Room) =>
                                                new Date(
                                                    b.createdAt ?? 0
                                                ).getTime() -
                                                new Date(
                                                    a.createdAt ?? 0
                                                ).getTime()
                                        )
                                    );
                                }}
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
                        {currentRooms.length === 0 && (
                            <div className="flex items-center justify-center text-red-400 mt-4">
                                <span>Không có phòng nào!</span>
                            </div>
                        )}
                        {currentRooms.map((room) => {
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
                                        <div className="flex items-center">
                                            <span className="text-rootColor roboto-bold">
                                                {Currency(room.price, 'vi-VN')}
                                                /tháng
                                            </span>
                                            <span className="ml-2">
                                                {room.acreage}m&sup2;{' '}
                                            </span>
                                            {isFavourite.includes(room._id) ? (
                                                <button
                                                    onClick={() =>
                                                        handleFavourite(
                                                            room._id
                                                        )
                                                    }
                                                    className="ml-2 text-red-500"
                                                >
                                                    <FaHeart />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() =>
                                                        handleFavourite(
                                                            room._id
                                                        )
                                                    }
                                                    className="ml-2"
                                                >
                                                    <FaRegHeart />
                                                </button>
                                            )}
                                        </div>

                                        <p className="mt-1  line-clamp-2 w-full">
                                            {room.description}
                                        </p>
                                        <span className="line-clamp-1 roboto-bold">
                                            Địa chỉ: {room.location.name}
                                        </span>
                                        <span>
                                            Đã đăng{' '}
                                            {formatTimeDifference(
                                                room.createdAt
                                            )}
                                            , thời gian đăng:{' '}
                                            {dateConvert(room.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <Pagination
                        currentPage={currentPage}
                        totalPage={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
                <div className="col-span-1">
                    <div className="p-2 rounded  bg-white shadow-custom-light">
                        {categories.map((category) => (
                            <div className="first:mt-0 mt-3" key={category._id}>
                                <h1 className="roboto-bold">{category.name}</h1>
                                <div className="grid grid-cols-2 gap-3">
                                    {category.child.map((child) => {
                                        const updatedChildName =
                                            child.name.replace(/m2/g, 'm²');

                                        return (
                                            <div
                                                className={`col-span-1 rounded hover:bg-rootColor hover:text-white cursor-pointer ${
                                                    listChildCate.includes(
                                                        child._id
                                                    )
                                                        ? 'bg-rootColor text-white roboto-bold'
                                                        : ''
                                                }`}
                                                key={child._id}
                                                onClick={() => {
                                                    setListChildCate((prev) => {
                                                        let updatedList;
                                                        if (
                                                            prev.includes(
                                                                child._id
                                                            )
                                                        ) {
                                                            updatedList =
                                                                prev.filter(
                                                                    (id) =>
                                                                        id !==
                                                                        child._id
                                                                );
                                                        } else {
                                                            updatedList = [
                                                                ...prev,
                                                                child._id,
                                                            ];
                                                        }

                                                        if (
                                                            updatedList.length ===
                                                            0
                                                        ) {
                                                            setFilterRooms(
                                                                rooms
                                                            );
                                                        }

                                                        return updatedList;
                                                    });
                                                    if (
                                                        !listChildCate.includes(
                                                            child._id
                                                        )
                                                    ) {
                                                        setListRoomId(
                                                            (prev) => [
                                                                ...prev,
                                                                ...(child.roomId ||
                                                                    []),
                                                            ]
                                                        );
                                                        const newList = [
                                                            ...listRoomId,
                                                            ...(child.roomId ||
                                                                []),
                                                        ];

                                                        const childSelect =
                                                            Array.from(
                                                                new Set(newList)
                                                            );

                                                        const selectRoom =
                                                            rooms.filter(
                                                                (room) =>
                                                                    childSelect.includes(
                                                                        room._id
                                                                    )
                                                            );
                                                        setFilterRooms(
                                                            selectRoom
                                                        );
                                                    } else {
                                                        if (child.roomId) {
                                                            const filteredChildCate =
                                                                listChildCate.filter(
                                                                    (
                                                                        childCate
                                                                    ) =>
                                                                        childCate !==
                                                                        child._id
                                                                );
                                                            const listChildCategory =
                                                                categories
                                                                    .map(
                                                                        (
                                                                            category
                                                                        ) => ({
                                                                            ...category,
                                                                            child: category.child.filter(
                                                                                (
                                                                                    child
                                                                                ) =>
                                                                                    filteredChildCate.includes(
                                                                                        child._id
                                                                                    )
                                                                            ),
                                                                        })
                                                                    )
                                                                    .filter(
                                                                        (
                                                                            category
                                                                        ) =>
                                                                            category
                                                                                .child
                                                                                .length >
                                                                            0
                                                                    );
                                                            const allRoomIds =
                                                                listChildCategory.flatMap(
                                                                    (
                                                                        category
                                                                    ) =>
                                                                        category.child.flatMap(
                                                                            (
                                                                                child
                                                                            ) =>
                                                                                child.roomId ||
                                                                                []
                                                                        )
                                                                );
                                                            setFilterRooms(
                                                                rooms.filter(
                                                                    (room) =>
                                                                        allRoomIds.includes(
                                                                            room._id
                                                                        )
                                                                )
                                                            );
                                                        }
                                                    }
                                                }}
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
