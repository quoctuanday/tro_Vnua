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

function ManageUserPage() {
    const searchRef = useRef<HTMLInputElement>(null);
    const [users, setUsers] = useState<User[]>([]);
    const { socket } = useUser();

    useEffect(() => {
        const getData = async () => {
            const response = await getAllUsers();
            if (response) {
                setUsers(response.data.users);
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
                            console.log(searchRef.current?.value);
                        }}
                        className="flex items-center absolute top-0 right-0 bottom-0 px-2 py-1 rounded-r-[10px] bg-rootColor hover:bg-[#699ba3b8]"
                    >
                        <IoSearch className="text-white" />
                    </button>
                </div>
                <button className="px-2 py-1 rounded-[10px] text-white bg-rootColor hover:bg-[#699ba3b8] flex items-center">
                    <MdFilterListAlt className="pr-1" />
                    Bộ lọc
                </button>
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
                {users.map((user, index) => (
                    <div className="grid grid-cols-8" key={user._id}>
                        <div className="col-span-1 py-2 flex justify-center items-center roboto-bold border-[1px]">
                            {index + 1}
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
                            <LuEye className="text-blue-400 cursor-pointer" />
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
            </div>
        </div>
    );
}

export default ManageUserPage;
