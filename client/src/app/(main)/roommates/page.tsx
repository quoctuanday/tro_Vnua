'use client';
import {
    addFavouriteRoommate,
    getAllRoommates,
    getCategory,
    getFavouritesRoommate,
    removeFavouriteRoommate,
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
import { IoSearch } from 'react-icons/io5';
import { Category } from '@/schema/Category';
import { MdKeyboardArrowRight } from 'react-icons/md';
import Currency from '@/utils/convertCurrency';
import Link from 'next/link';
import dateConvert from '@/utils/convertDate';
import Pagination from '@/components/pagination';
import { useUser } from '@/store/userData';
import { Roommate } from '@/schema/Roommate';
import formatTimeDifference from '@/utils/formatTime';

function RoommatematePage() {
    const { socket, userLoginData } = useUser();
    const [roommates, setRoommates] = useState<Roommate[]>([]);
    const [filterRoommates, setFilterRoommates] = useState<Roommate[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [categories, setCategories] = useState<Category[]>([]);
    const [listRoommateId, setListRoommateId] = useState<string[]>([]);
    const [listChildCate, setListChildCate] = useState<string[]>([]);
    const [numberOfRoommate, setNumberOfRoommate] = useState(0);
    const [typeSort, setTypeSort] = useState<'Đề xuất' | 'Mới nhất'>('Đề xuất');
    const [isFavourite, setIsFavourite] = useState<string[]>([]);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const getRoommates = async () => {
            const response = await getAllRoommates();
            if (response && response.data.formattedRoommates) {
                const data = response.data.formattedRoommates;
                const availableRoommates = data.filter(
                    (roommate: Roommate) =>
                        roommate.isAvailable && roommate.isCheckout
                );

                availableRoommates.sort((a: Roommate, b: Roommate) => {
                    if (userLoginData?.gender) {
                        if (
                            a.require.gender === userLoginData.gender &&
                            b.require.gender !== userLoginData.gender
                        )
                            return -1;
                        if (
                            a.require.gender !== userLoginData.gender &&
                            b.require.gender === userLoginData.gender
                        )
                            return 1;
                    }
                    return b.rate - a.rate;
                });

                setNumberOfRoommate(availableRoommates.length);

                setRoommates(availableRoommates);
                setFilterRoommates(availableRoommates);
            }
        };
        const getFavouriteRoommates = async () => {
            const response = await getFavouritesRoommate();
            if (response && response.data.roomIds) {
                const data = response.data.roomIds;
                console.log(data);
                setIsFavourite(data);
            }
        };
        const getCategories = async () => {
            const response = await getCategory();
            if (response && response.data.category) {
                const data = response.data.category;
                setCategories(data);
            }
        };
        getRoommates();
        getFavouriteRoommates();
        getCategories();
        if (!socket) return;
        socket.on('roommateFavourite-update', () => {
            console.log('update favourite');
            getFavouriteRoommates();
        });
        socket.on('category-update', () => {
            getCategories();
        });
        socket.on('roommate-update', () => {
            getRoommates();
        });
    }, [socket, userLoginData]);

    const handleFavourite = async (roommateId: string) => {
        if (isFavourite.includes(roommateId)) {
            await removeFavouriteRoommate(roommateId);
        } else {
            await addFavouriteRoommate(roommateId);
        }
    };
    const handleSearch = () => {
        const searchResults = roommates.filter((roommate) => {
            if (!roommate.title) return;
            if (!searchInputRef.current) return;
            const value = searchInputRef.current.value;
            const matchTitle = roommate.title
                .toLowerCase()
                .includes(value.toLowerCase());

            return matchTitle;
        });
        console.log(searchResults);
        if (searchResults.length > 0) {
            setCurrentPage(1);
            setFilterRoommates(searchResults);
        } else {
            setFilterRoommates([]);
        }
        if (!searchInputRef.current) return;
        searchInputRef.current.value = '';
    };

    const roommatesPerPage = 5;
    const totalRoommates = filterRoommates.length;
    const totalPages = Math.ceil(totalRoommates / roommatesPerPage);
    const startIndex = (currentPage - 1) * roommatesPerPage;
    const endIndex = startIndex + roommatesPerPage;
    const currentRoommates = filterRoommates.slice(startIndex, endIndex);

    return (
        <div className="pt-6">
            <div className="grid grid-cols-3 gap-8">
                <div className="col-span-2">
                    <h1 className="roboto-bold text-[1.3rem]">Phòng ở ghép</h1>
                    <span className="">
                        Có {numberOfRoommate} tin đăng cho thuê.
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
                                    setFilterRoommates(
                                        roommates.sort(
                                            (a: Roommate, b: Roommate) =>
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
                                    setFilterRoommates(
                                        roommates.sort(
                                            (a: Roommate, b: Roommate) =>
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
                        {currentRoommates.length === 0 && (
                            <div className="flex items-center justify-center text-red-400 mt-4">
                                <span>Không có phòng nào!</span>
                            </div>
                        )}
                        {currentRoommates.map((roommate) => {
                            const images = roommate.images.slice(0, 4);
                            return (
                                <div
                                    className="bg-white p-4 first:mt-0 mt-3 rounded shadow-custom-light grid grid-rows-3"
                                    key={roommate._id}
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
                                                {roommate.images.length}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="row-span-1 ">
                                        <Link
                                            href={`/roommates/${roommate._id}`}
                                            className="mt-2 roboto-bold text-[1.2rem] hover:underline text-blue-500 "
                                        >
                                            {roommate.title}
                                        </Link>
                                        <div className="flex items-center mt-1">
                                            {Array.from({ length: 5 }).map(
                                                (_, index) => {
                                                    if (
                                                        index <
                                                        Math.floor(
                                                            roommate.rate || 0
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
                                                                roommate.rate ||
                                                                    0
                                                            ) +
                                                                1 &&
                                                        roommate.rate % 1 >= 0.5
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
                                        <div className="flex items-center text-rootColor roboto-bold">
                                            <span>Yêu cầu:</span>
                                            <span className="ml-1">
                                                Giới tính:{' '}
                                                {roommate.require.gender},
                                            </span>
                                            <span className="ml-1">
                                                {' '}
                                                độ tuổi: từ{' '}
                                                {
                                                    roommate.require.age.min
                                                } đến {roommate.require.age.max}
                                                ,
                                            </span>

                                            <span className=" ml-1">
                                                {' '}
                                                tiền thuê:
                                                {Currency(
                                                    roommate.price,
                                                    'vi-VN'
                                                )}
                                                /tháng
                                            </span>
                                            <span className="ml-2">
                                                {roommate.acreage}m&sup2;{' '}
                                            </span>
                                            {isFavourite.includes(
                                                roommate._id
                                            ) ? (
                                                <button
                                                    onClick={() =>
                                                        handleFavourite(
                                                            roommate._id
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
                                                            roommate._id
                                                        )
                                                    }
                                                    className="ml-2"
                                                >
                                                    <FaRegHeart />
                                                </button>
                                            )}
                                        </div>

                                        <p className="mt-1  line-clamp-2 w-full">
                                            {roommate.description}
                                        </p>
                                        <span className="line-clamp-1 roboto-bold">
                                            Địa chỉ: {roommate.location.name}
                                        </span>
                                        <span>
                                            Đã đăng{' '}
                                            {formatTimeDifference(
                                                roommate.createdAt
                                            )}
                                            , thời gian đăng:{' '}
                                            {dateConvert(roommate.createdAt)}
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
                                                className={`col-span-1 flex items-center hover:bg-rootColor hover:text-white rounded cursor-pointer ${
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
                                                            setFilterRoommates(
                                                                roommates
                                                            );
                                                        }

                                                        return updatedList;
                                                    });
                                                    if (
                                                        !listChildCate.includes(
                                                            child._id
                                                        )
                                                    ) {
                                                        setListRoommateId(
                                                            (prev) => [
                                                                ...prev,
                                                                ...(child.roommateId ||
                                                                    []),
                                                            ]
                                                        );
                                                        const newList = [
                                                            ...listRoommateId,
                                                            ...(child.roommateId ||
                                                                []),
                                                        ];

                                                        const childSelect =
                                                            Array.from(
                                                                new Set(newList)
                                                            );

                                                        const selectRoommate =
                                                            roommates.filter(
                                                                (roommate) =>
                                                                    childSelect.includes(
                                                                        roommate._id
                                                                    )
                                                            );
                                                        setFilterRoommates(
                                                            selectRoommate
                                                        );
                                                    } else {
                                                        if (child.roommateId) {
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
                                                            const allRoommateIds =
                                                                listChildCategory.flatMap(
                                                                    (
                                                                        category
                                                                    ) =>
                                                                        category.child.flatMap(
                                                                            (
                                                                                child
                                                                            ) =>
                                                                                child.roommateId ||
                                                                                []
                                                                        )
                                                                );
                                                            setFilterRoommates(
                                                                roommates.filter(
                                                                    (
                                                                        roommate
                                                                    ) =>
                                                                        allRoommateIds.includes(
                                                                            roommate._id
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

export default RoommatematePage;
