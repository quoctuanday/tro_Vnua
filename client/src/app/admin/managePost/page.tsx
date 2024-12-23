'use client';
import { getAllRooms } from '@/api/api';
import Pagination from '@/components/pagination';
import { Room } from '@/schema/room';
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
import InfoRoom from '@/components/infoRoom';

type Status = 'both' | 'available' | 'unavailable';
type Checkout = 'both' | 'available' | 'unavailable';
type Time = 'week' | 'month' | 'year' | 'specificTime' | null;
function ManagePostPage() {
    const searchRef = useRef<HTMLInputElement>(null);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [filterRooms, setFilterRooms] = useState<Room[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const { socket } = useUser();
    const [message, setMessage] = useState('');
    const [isRotating, setIsRotating] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<Status>('both');
    const [selectedCheckout, setSelectedCheckout] = useState<Checkout>('both');
    const [selectedTime, setSelectedTime] = useState<Time>(null);
    const [specificTimeValue, setSpecificTimeValue] = useState('');
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [formOpen, setFormOpen] = useState(false);

    useEffect(() => {
        const getData = async () => {
            const response = await getAllRooms();
            if (response) {
                console.log(response.data.formattedRooms);
                setRooms(response.data.formattedRooms);
                setFilterRooms(response.data.formattedRooms);
            }
        };
        getData();
        if (!socket) return;
        socket.on('room-update', () => {
            console.log('Room updated');
            getData();
        });
    }, [socket]);

    //Search
    const handleSearch = () => {
        const searchResults = rooms.filter((room) => {
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
            setFilterRooms(searchResults);
        } else {
            setMessage('Không tìm thấy bài đăng nào !');
            setFilterRooms([]);
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
        let filtResult = rooms;
        if (selectedStatus && selectedStatus !== 'both') {
            switch (selectedStatus) {
                case 'available':
                    filtResult = rooms.filter((room) => {
                        return room.isAvailable === true;
                    });
                    break;
                case 'unavailable':
                    filtResult = rooms.filter((room) => {
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
                    filtResult = rooms.filter((room) => {
                        return room.isCheckout === true;
                    });
                    break;
                case 'unavailable':
                    filtResult = rooms.filter((room) => {
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
        setFilterRooms(filtResult);
        setIsFilterOpen(false);
    };

    //Pagination
    const roomsPerPage = 5;
    const totalRooms = filterRooms.length;
    const totalPages = Math.ceil(totalRooms / roomsPerPage);
    const startIndex = (currentPage - 1) * roomsPerPage;
    const endIndex = startIndex + roomsPerPage;
    const currentRooms = filterRooms.slice(startIndex, endIndex);

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
                            setFilterRooms(rooms);
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
                            } bg-white p-3 rounded absolute top-[100%] roboto-bold shadow-custom-light right-[100%] w-[30rem] transition-all duration-500 ease-in-out`}
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
                {currentRooms.length > 0 && (
                    <div className="">
                        {currentRooms.map((room, index) => (
                            <div
                                className="grid grid-cols-12  h-[3.75rem]"
                                key={room._id}
                            >
                                <div className="col-span-1 flex justify-center items-center py-1 roboto-bold border-[1px]">
                                    {startIndex + index + 1}
                                </div>
                                <div className="col-span-3 flex  items-center py-1 roboto-bold border-[1px] line-clamp-2 px-1">
                                    {room.title}
                                </div>
                                <div className="col-span-1 flex justify-center items-center py-1 roboto-bold border-[1px]">
                                    {room.userName}
                                </div>
                                <div className="col-span-2 flex justify-center items-center py-1 roboto-bold border-[1px]">
                                    {room.createdAt
                                        ? dateConvert(room.createdAt)
                                        : ''}
                                </div>
                                <div className="col-span-2 flex justify-center items-center py-1 roboto-bold border-[1px]">
                                    {room.isAvailable
                                        ? 'Đã duyệt'
                                        : 'Chưa được duyệt'}
                                </div>
                                <div className="col-span-2 flex justify-center items-center py-1 roboto-bold border-[1px]">
                                    {room.isCheckout
                                        ? 'Đã thanh toán'
                                        : 'Chưa thanh toán'}
                                </div>
                                <div className="col-span-1 flex justify-center items-center py-1 roboto-bold border-[1px]">
                                    <button
                                        onClick={() => {
                                            setSelectedRoom(room);
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
                            <InfoRoom
                                setFormOpen={setFormOpen}
                                room={selectedRoom}
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

export default ManagePostPage;
