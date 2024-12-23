'use client';
import { getAllRoommates } from '@/api/api';
import Pagination from '@/components/pagination';
import { useUser } from '@/store/userData';
import dateConvert from '@/utils/convertDate';
import React, { useEffect, useRef, useState } from 'react';
import { AiOutlineRedo } from 'react-icons/ai';
import { IoSearch } from 'react-icons/io5';
import { MdFilterListAlt } from 'react-icons/md';
import {
    subWeeks,
    subMonths,
    subYears,
    isWithinInterval,
    parseISO,
} from 'date-fns';
import { Roommate } from '@/schema/Roommate';
import InfoRoommatemate from '@/components/infoRoommate';

type Checkout = 'both' | 'available' | 'unavailable';
type Status = 'both' | 'available' | 'unavailable';
type Time = 'week' | 'month' | 'year' | 'specificTime' | null;
function ManageRoomatePage() {
    const searchRef = useRef<HTMLInputElement>(null);
    const [roommates, setRoommates] = useState<Roommate[]>([]);
    const [filterRoommates, setFilterRoommates] = useState<Roommate[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const { socket } = useUser();
    const [message, setMessage] = useState('');
    const [isRotating, setIsRotating] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<Status>('both');
    const [selectedCheckout, setSelectedCheckout] = useState<Checkout>('both');

    const [selectedTime, setSelectedTime] = useState<Time>(null);
    const [specificTimeValue, setSpecificTimeValue] = useState('');
    const [selectedRoommate, setSelectedRoommate] = useState<Roommate | null>(
        null
    );
    const [formOpen, setFormOpen] = useState(false);

    useEffect(() => {
        const getData = async () => {
            const response = await getAllRoommates();
            if (response) {
                console.log(response.data.formattedRoommates);
                setRoommates(response.data.formattedRoommates);
                setFilterRoommates(response.data.formattedRoommates);
            }
        };
        getData();
        if (!socket) return;
        socket.on('roommate-update', () => {
            console.log('Roommate updated');
            getData();
        });
    }, [socket]);

    //Search
    const handleSearch = () => {
        const searchResults = roommates.filter((room) => {
            if (!room.userName) return;
            if (!searchRef.current) return;
            const value = searchRef.current.value;
            const matchUserName = room.userName
                .toLowerCase()
                .includes(value.toLowerCase());

            return matchUserName;
        });
        console.log(searchResults);
        if (searchResults.length > 0) {
            setMessage('');
            setCurrentPage(1);
            setFilterRoommates(searchResults);
        } else {
            setMessage('Không tìm thấy bài đăng nào !');
            setFilterRoommates([]);
        }
        if (!searchRef.current) return;
        searchRef.current.value = '';
    };

    //Filter
    const handleStatusClick = (status: Status) => {
        setSelectedStatus((prevStatus) =>
            prevStatus === status ? 'both' : status
        );
    };
    const handleCheckoutClick = (checkout: Checkout) => {
        setSelectedCheckout((prevcheckout) =>
            prevcheckout === checkout ? 'both' : checkout
        );
    };
    const handleTimeClick = (status: Time) => {
        setSelectedTime((prevStatus) =>
            prevStatus === status ? null : status
        );
    };

    const handleFilter = () => {
        let filtResult = roommates;
        if (selectedStatus && selectedStatus !== 'both') {
            switch (selectedStatus) {
                case 'available':
                    filtResult = roommates.filter((room) => {
                        return room.isAvailable === true;
                    });
                    break;
                case 'unavailable':
                    filtResult = roommates.filter((room) => {
                        return room.isAvailable === false;
                    });
                    break;
                default:
                    break;
            }
        }
        if (selectedCheckout && selectedCheckout !== 'both') {
            switch (selectedCheckout) {
                case 'available':
                    filtResult = roommates.filter((room) => {
                        return room.isCheckout === true;
                    });
                    break;
                case 'unavailable':
                    filtResult = roommates.filter((room) => {
                        return room.isCheckout === false;
                    });
                    break;
                default:
                    break;
            }
        }
        if (selectedTime) {
            const now = new Date();
            switch (selectedTime) {
                case 'week':
                    {
                        const start = subWeeks(now, 1);
                        filtResult = filtResult.filter((room) => {
                            if (room.createdAt) {
                                return isWithinInterval(
                                    parseISO(room.createdAt),
                                    {
                                        start,
                                        end: now,
                                    }
                                );
                            }
                            return;
                        });
                    }
                    break;

                case 'month':
                    {
                        const start = subMonths(now, 1);
                        filtResult = filtResult.filter((room) => {
                            if (room.createdAt) {
                                return isWithinInterval(
                                    parseISO(room.createdAt),
                                    {
                                        start,
                                        end: now,
                                    }
                                );
                            }
                            return;
                        });
                    }
                    break;
                case 'year':
                    {
                        const start = subYears(now, 1);
                        filtResult = filtResult.filter((room) => {
                            if (room.createdAt) {
                                return isWithinInterval(
                                    parseISO(room.createdAt),
                                    {
                                        start,
                                        end: now,
                                    }
                                );
                            }
                            return;
                        });
                    }
                    break;
                case 'specificTime':
                    {
                        const specificDate = new Date(specificTimeValue);
                        filtResult = filtResult.filter((room) => {
                            if (room.createdAt) {
                                const createdDate = parseISO(room.createdAt);
                                return (
                                    createdDate.getFullYear() ===
                                        specificDate.getFullYear() &&
                                    createdDate.getMonth() ===
                                        specificDate.getMonth() &&
                                    createdDate.getDate() ===
                                        specificDate.getDate()
                                );
                            }
                            return;
                        });
                    }
                    break;
                default:
                    break;
            }
        }
        setFilterRoommates(filtResult);
        setIsFilterOpen(false);
    };

    //Pagination
    const roommatesPerPage = 5;
    const totalRoommates = filterRoommates.length;
    const totalPages = Math.ceil(totalRoommates / roommatesPerPage);
    const startIndex = (currentPage - 1) * roommatesPerPage;
    const endIndex = startIndex + roommatesPerPage;
    const currentRoommates = filterRoommates.slice(startIndex, endIndex);

    return (
        <div>
            <div className="h-[3rem] flex items-center justify-between px-2">
                <div className="relative w-[40%]">
                    <input
                        ref={searchRef}
                        type="text"
                        placeholder="Tìm kiếm"
                        className="outline-none rounded-[10px] w-full px-2 py-1 border-[1px]"
                    />
                    <button
                        onClick={() => {
                            handleSearch();
                        }}
                        className="flex items-center absolute top-0 right-0 bottom-0 px-2 py-1 rounded-r-[10px] bg-rootColor hover:bg-[#699ba3b8]"
                    >
                        <IoSearch className="text-white" />
                    </button>
                </div>
                <div className="flex items-center ">
                    <button
                        onClick={() => {
                            setFilterRoommates(roommates);
                            setCurrentPage(1);
                            setMessage('');
                            setIsRotating(true);
                            setTimeout(() => {
                                setIsRotating(false);
                            }, 1000);
                        }}
                        className="text-white bg-rootColor hover:bg-[#699ba3b8] p-1 rounded-full"
                    >
                        <AiOutlineRedo className={`${isRotating && 'spin'}`} />
                    </button>
                    <div className="relative ml-3">
                        <button
                            onClick={() => {
                                setIsFilterOpen(!isFilterOpen);
                            }}
                            className="px-2 py-1 rounded-[10px] text-white bg-rootColor hover:bg-[#699ba3b8] flex items-center"
                        >
                            <MdFilterListAlt className="pr-1" />
                            Bộ lọc
                        </button>
                        <div
                            className={`${
                                isFilterOpen
                                    ? 'opacity-100 block '
                                    : 'opacity-0 hidden'
                            } box-open bg-white p-3 rounded absolute top-[100%] roboto-bold shadow-custom-light right-[100%] w-[30rem] transition-all duration-500 ease-in-out`}
                        >
                            <h1>Trạng thái</h1>
                            <div className="mt-2 flex items-center">
                                <button
                                    onClick={() => {
                                        handleStatusClick('unavailable');
                                    }}
                                    className={`border-2 rounded-[10px] px-2 py-1 transition-colors duration-300 ${
                                        selectedStatus === 'unavailable' &&
                                        'bg-rootColor text-white'
                                    }`}
                                >
                                    Chưa duyệt
                                </button>
                                <button
                                    onClick={() => {
                                        handleStatusClick('available');
                                    }}
                                    className={`border-2 ml-3 rounded-[10px] px-2 py-1 transition-colors duration-300 ${
                                        selectedStatus === 'available' &&
                                        'bg-rootColor text-white'
                                    }`}
                                >
                                    Đã duyệt
                                </button>
                                <button
                                    onClick={() => {
                                        handleStatusClick('both');
                                    }}
                                    className={`border-2 ml-3 rounded-[10px] px-2 py-1 transition-colors duration-300 ${
                                        selectedStatus === 'both' &&
                                        'bg-rootColor text-white'
                                    }`}
                                >
                                    Cả hai
                                </button>
                            </div>
                            <h1>Thanh toán</h1>
                            <div className="mt-2 flex items-center">
                                <button
                                    onClick={() => {
                                        handleCheckoutClick('unavailable');
                                    }}
                                    className={`border-2 rounded-[10px] px-2 py-1 transition-colors duration-300 ${
                                        selectedCheckout === 'unavailable' &&
                                        'bg-rootColor text-white'
                                    }`}
                                >
                                    Chưa thanh toán
                                </button>
                                <button
                                    onClick={() => {
                                        handleCheckoutClick('available');
                                    }}
                                    className={`border-2 ml-3 rounded-[10px] px-2 py-1 transition-colors duration-300 ${
                                        selectedCheckout === 'available' &&
                                        'bg-rootColor text-white'
                                    }`}
                                >
                                    Đã thanh toán
                                </button>
                                <button
                                    onClick={() => {
                                        handleCheckoutClick('both');
                                    }}
                                    className={`border-2 ml-3 rounded-[10px] px-2 py-1 transition-colors duration-300 ${
                                        selectedCheckout === 'both' &&
                                        'bg-rootColor text-white'
                                    }`}
                                >
                                    Cả hai
                                </button>
                            </div>
                            <div className="mt-2">
                                <h1>Ngày đăng</h1>
                                <div className="flex items-center mt-1">
                                    <button
                                        onClick={() => {
                                            handleTimeClick('week');
                                        }}
                                        className={`border-2 rounded-[10px] px-2 py-1 transition-colors duration-300 ${
                                            selectedTime === 'week' &&
                                            'bg-rootColor text-white'
                                        }`}
                                    >
                                        Tuần qua
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleTimeClick('month');
                                        }}
                                        className={`border-2 ml-3 rounded-[10px] px-2 py-1 transition-colors duration-300 ${
                                            selectedTime === 'month' &&
                                            'bg-rootColor text-white'
                                        }`}
                                    >
                                        Tháng qua
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleTimeClick('year');
                                        }}
                                        className={`border-2 ml-3 rounded-[10px] px-2 py-1 transition-colors duration-300 ${
                                            selectedTime === 'year' &&
                                            'bg-rootColor text-white'
                                        }`}
                                    >
                                        Năm qua
                                    </button>
                                </div>
                                <div className="mt-1">
                                    <p>Hoặc chọn ngày cụ thể: </p>
                                    <input
                                        type="date"
                                        className="mt-1 outline-none border-2 px-2 py-1 rounded-[10px]"
                                        onChange={(e) => {
                                            setSelectedTime('specificTime');
                                            setSpecificTimeValue(
                                                e.target.value
                                            );
                                        }}
                                    />
                                </div>
                                <div className="flex items-center justify-end">
                                    <button
                                        onClick={handleFilter}
                                        className="px-2 py-1 rounded-[10px] text-white bg-rootColor hover:bg-[#699ba3b8]"
                                    >
                                        Lọc
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-white">
                <div className="grid grid-cols-12">
                    <div className="col-span-1 flex justify-center items-center py-1 roboto-bold border-[1px]">
                        Stt
                    </div>
                    <div className="col-span-3 flex justify-center items-center py-1 roboto-bold border-[1px]">
                        Tiêu đề
                    </div>
                    <div className="col-span-1 flex justify-center items-center py-1 roboto-bold border-[1px]">
                        Người đăng
                    </div>
                    <div className="col-span-2 flex justify-center items-center py-1 roboto-bold border-[1px]">
                        Ngày đăng
                    </div>
                    <div className="col-span-2 flex justify-center items-center py-1 roboto-bold border-[1px]">
                        Trạng thái
                    </div>
                    <div className="col-span-2 flex justify-center items-center py-1 roboto-bold border-[1px]">
                        Thanh toán
                    </div>
                    <div className="col-span-1 flex justify-center items-center py-1 roboto-bold border-[1px]">
                        Thao tác
                    </div>
                </div>
                {message && (
                    <div className="mt-4 flex items-center justify-center pb-4 text-red-500">
                        {message}
                    </div>
                )}
                {currentRoommates.length > 0 && (
                    <div className="">
                        {currentRoommates.map((roommate, index) => (
                            <div
                                className="grid grid-cols-12  h-[3.75rem]"
                                key={roommate._id}
                            >
                                <div className="col-span-1 flex justify-center items-center py-1 roboto-bold border-[1px]">
                                    {startIndex + index + 1}
                                </div>
                                <div className="col-span-3 flex  items-center py-1 roboto-bold border-[1px] line-clamp-2 px-1">
                                    {roommate.title}
                                </div>
                                <div className="col-span-1 flex justify-center items-center py-1 roboto-bold border-[1px]">
                                    {roommate.userName}
                                </div>
                                <div className="col-span-2 flex justify-center items-center py-1 roboto-bold border-[1px]">
                                    {roommate.createdAt
                                        ? dateConvert(roommate.createdAt)
                                        : ''}
                                </div>
                                <div className="col-span-2 flex justify-center items-center py-1 roboto-bold border-[1px]">
                                    {roommate.isAvailable
                                        ? 'Đã duyệt'
                                        : 'Chưa được duyệt'}
                                </div>
                                <div className="col-span-2 flex justify-center items-center py-1 roboto-bold border-[1px]">
                                    {roommate.isCheckout
                                        ? 'Đã thanh toán'
                                        : 'Chưa thanh toán'}
                                </div>
                                <div className="col-span-1 flex justify-center items-center py-1 roboto-bold border-[1px]">
                                    <button
                                        onClick={() => {
                                            setSelectedRoommate(roommate);
                                            setFormOpen(true);
                                        }}
                                        className="px-2 py-1 rounded-[10px] bg-rootColor hover:bg-[#699ba3b8] text-white "
                                    >
                                        Xem
                                    </button>
                                </div>
                            </div>
                        ))}
                        {formOpen && (
                            <InfoRoommatemate
                                setFormOpen={setFormOpen}
                                roommate={selectedRoommate}
                            />
                        )}
                        <Pagination
                            currentPage={currentPage}
                            totalPage={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default ManageRoomatePage;
