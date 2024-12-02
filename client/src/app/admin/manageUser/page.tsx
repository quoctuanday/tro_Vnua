'use client';
import { IoSearch } from 'react-icons/io5';
import React, { useEffect, useRef, useState } from 'react';
import { MdFilterListAlt } from 'react-icons/md';
import { User } from '@/schema/user';
import { getAllUsers, updateUser } from '@/api/api';
import Image from 'next/image';
import dateConvert from '@/utils/convertDate';
import { LuEye, LuLock, LuUnlock } from 'react-icons/lu';
import { useUser } from '@/store/userData';
import Pagination from '@/components/pagination';
import { AiOutlineRedo } from 'react-icons/ai';
import InfoUser from '@/components/infoUser';

type Role = 'admin' | 'moderator' | 'user';
type Status = 'both' | 'unBlocked' | 'blocked';

function ManageUserPage() {
    const searchRef = useRef<HTMLInputElement>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [filterUser, setFilterUser] = useState<User[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const { socket } = useUser();
    const [message, setMessage] = useState('');
    const [isRotating, setIsRotating] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<Status>('both');
    const [infoForm, setInfoForm] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    useEffect(() => {
        const getData = async () => {
            const response = await getAllUsers();
            if (response) {
                setUsers(response.data.users);
                setFilterUser(response.data.users);
            }
        };
        getData();
        if (!socket) return;
        socket.on('user-update', () => {
            console.log('User updated');
            getData();
        });
    }, [socket]);

    const handleBlockUser = (isBlocked: boolean, userId: string) => {
        console.log(isBlocked, userId);
        const updatedData = async () => {
            const response = await updateUser(userId, { isBlocked: isBlocked });
            if (response) return;
        };
        updatedData();
    };

    //Search
    const handleSearch = () => {
        const searchResults = users.filter((user) => {
            if (!searchRef.current) return;
            const value = searchRef.current.value;
            const matchUserName = user.userName
                .toLowerCase()
                .includes(value.toLowerCase());
            const matchPhoneNumber = user.phoneNumber?.includes(
                value.toLowerCase()
            );
            return matchUserName || matchPhoneNumber;
        });
        console.log(searchResults);
        if (searchResults.length > 0) {
            setMessage('');
            setCurrentPage(1);
            setFilterUser(searchResults);
        } else {
            setMessage('Không tìm thấy tài khoản nào !');
            setFilterUser([]);
        }
        if (!searchRef.current) return;
        searchRef.current.value = '';
    };

    //Filter
    const handleRoleClick = (role: Role) => {
        setSelectedRoles((prevRoles) => {
            if (prevRoles.includes(role)) {
                return prevRoles.filter((item) => item !== role);
            } else {
                return [...prevRoles, role];
            }
        });
    };
    const handleStatusClick = (status: Status) => {
        setSelectedStatus((prevStatus) =>
            prevStatus === status ? 'both' : status
        );
    };

    const handleFilter = () => {
        const filterResult = users.filter((user) => {
            const matchRole =
                selectedRoles.length === 0 || selectedRoles.includes(user.role);
            const matchStatus =
                selectedStatus === 'both' ||
                (selectedStatus === 'unBlocked' && !user.isBlocked) ||
                (selectedStatus === 'blocked' && user.isBlocked);
            return matchRole && matchStatus;
        });
        console.log(filterResult);
        if (!filterResult) {
            setMessage('Không tìm thấy tài khoản nào !');
        }
        setFilterUser(filterResult);
        setIsFilterOpen(false);
    };

    //Pagination
    const usersPerPage = 5;
    const totalUsers = filterUser.length;
    const totalPages = Math.ceil(totalUsers / usersPerPage);
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const currentUsers = filterUser.slice(startIndex, endIndex);
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
                            setFilterUser(users);
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
                            } bg-white p-3 rounded absolute top-[100%] shadow-custom-light right-[100%] w-[30rem] transition-all duration-500 ease-in-out`}
                        >
                            <div>
                                <h1 className="roboto-bold">Vai trò</h1>
                                <div className="mt-2 flex items-center">
                                    <button
                                        onClick={() => {
                                            handleRoleClick('admin');
                                        }}
                                        className={`border-2 rounded-[10px] px-2 py-1 transition-colors duration-300 ${
                                            selectedRoles.includes('admin') &&
                                            'bg-rootColor text-white'
                                        }`}
                                    >
                                        Quản trị viên
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleRoleClick('moderator');
                                        }}
                                        className={`border-2 ml-3 rounded-[10px] px-2 py-1 transition-colors duration-300 ${
                                            selectedRoles.includes(
                                                'moderator'
                                            ) && 'bg-rootColor text-white'
                                        }`}
                                    >
                                        Người kiểm duyệt
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleRoleClick('user');
                                        }}
                                        className={`border-2 ml-3 rounded-[10px] px-2 py-1 transition-colors duration-300 ${
                                            selectedRoles.includes('user') &&
                                            'bg-rootColor text-white'
                                        }`}
                                    >
                                        Người dùng
                                    </button>
                                </div>
                            </div>
                            <div className="mt-2">
                                <h1 className="roboto-bold">Trạng thái</h1>
                                <div className="mt-2 flex items-center">
                                    <button
                                        onClick={() => {
                                            handleStatusClick('unBlocked');
                                        }}
                                        className={`border-2 rounded-[10px] px-2 py-1 transition-colors duration-300 ${
                                            selectedStatus === 'unBlocked' &&
                                            'bg-rootColor text-white'
                                        }`}
                                    >
                                        Chưa khóa
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleStatusClick('blocked');
                                        }}
                                        className={`border-2 ml-3 rounded-[10px] px-2 py-1 transition-colors duration-300 ${
                                            selectedStatus === 'blocked' &&
                                            'bg-rootColor text-white'
                                        }`}
                                    >
                                        Đã khóa
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
            <div className="bg-white">
                <div className="grid grid-cols-8">
                    <div className="col-span-1 flex justify-center items-center py-1 roboto-bold border-[1px]">
                        Stt
                    </div>
                    <div className="col-span-2 flex justify-center items-center py-1 roboto-bold border-[1px]">
                        Tài khoản
                    </div>

                    <div className="col-span-1 flex justify-center items-center py-1 roboto-bold border-[1px]">
                        Ảnh đại diện
                    </div>
                    <div className="col-span-1 flex justify-center items-center py-1 roboto-bold border-[1px]">
                        Vai trò
                    </div>
                    <div className="col-span-2 flex justify-center items-center py-1 roboto-bold border-[1px]">
                        Ngày tạo
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
                {currentUsers.length > 0 && (
                    <div className="">
                        {currentUsers.map((user, index) => (
                            <div className="grid grid-cols-8" key={user._id}>
                                <div className="col-span-1 py-2 flex justify-center items-center roboto-bold border-[1px]">
                                    {startIndex + index + 1}
                                </div>
                                <div className="col-span-2 py-2 flex justify-center items-center roboto-bold border-[1px]">
                                    {user.userName}
                                </div>
                                <div className="col-span-1 py-2 flex justify-center items-center roboto-bold border-[1px]">
                                    <Image
                                        src={
                                            user.image
                                                ? user.image
                                                : '/images/avatar-trang.jpg'
                                        }
                                        alt=""
                                        width={100}
                                        height={100}
                                        className="rounded-full w-[4rem]"
                                    ></Image>
                                </div>
                                <div className="col-span-1 py-2 flex justify-center items-center roboto-bold border-[1px]">
                                    {user.role == 'admin' && (
                                        <p className="">Quản trị viên</p>
                                    )}
                                    {user.role == 'moderator' && (
                                        <p className="">Người kiểm duyệt</p>
                                    )}
                                    {user.role == 'user' && (
                                        <p className="">Người dùng</p>
                                    )}
                                </div>
                                <div className="col-span-2 py-2 flex justify-center items-center roboto-bold border-[1px]">
                                    {dateConvert(user.createdAt)}
                                </div>
                                <div className="col-span-1 py-2 flex justify-center items-center roboto-bold border-[1px]">
                                    <button
                                        onClick={() => {
                                            setInfoForm(true);
                                            setSelectedUser(user);
                                        }}
                                    >
                                        <LuEye className="text-blue-400 cursor-pointer" />
                                    </button>
                                    {user.isBlocked ? (
                                        <button className="ml-3">
                                            {' '}
                                            <LuLock
                                                className="text-red-400 cursor-pointer"
                                                onClick={() =>
                                                    handleBlockUser(
                                                        !user.isBlocked,
                                                        user._id
                                                    )
                                                }
                                            />
                                        </button>
                                    ) : (
                                        <button className="ml-3">
                                            {' '}
                                            <LuUnlock
                                                className="text-red-400 cursor-pointer"
                                                onClick={() =>
                                                    handleBlockUser(
                                                        !user.isBlocked,
                                                        user._id
                                                    )
                                                }
                                            />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {infoForm && (
                            <InfoUser
                                user={selectedUser}
                                setFormOpen={setInfoForm}
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

export default ManageUserPage;
