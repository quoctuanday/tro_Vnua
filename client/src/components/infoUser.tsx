'use client';
import { User } from '@/schema/user';
import React from 'react';
import { IoClose } from 'react-icons/io5';
import { formatDate } from 'date-fns';
import Image from 'next/image';
import { updateUser } from '@/api/api';
import toast, { Toaster } from 'react-hot-toast';

interface Props {
    setFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
    user: User | null;
}

function InfoUser({ setFormOpen, user }: Props) {
    const handleChangeRole = (role: string) => {
        const updateRole = async () => {
            try {
                const response = await updateUser(user?._id, { role: role });
                if (response) {
                    toast.success('Đổi vai trò thành công!');
                    setFormOpen(false);
                }
            } catch (error) {
                console.log(error);
            }
        };
        updateRole();
    };
    if (!user) return;
    return (
        <div className="fixed z-[999] top-0 left-0 bottom-0 right-0">
            <div
                onClick={() => setFormOpen(false)}
                className="absolute top-0 left-0 bottom-0 right-0 opacity-50 bg-[#ccc]"
            ></div>
            <div className="relative h-[100vh] flex items-center justify-center">
                <div className="w-[30rem] h-[30rem] p-2 bg-white rounded">
                    <div className="flex items-center justify-end">
                        <button
                            onClick={() => setFormOpen(false)}
                            className="text-[1.4rem] rounded  hover:bg-red-400 hover:text-white"
                        >
                            <IoClose />
                        </button>
                    </div>
                    <h1 className="text-center text-[1.6rem] roboto-bold">
                        Thông tin người dùng
                    </h1>
                    <div className="mt-2 roboto-bold">
                        <div className="flex items-center justify-center">
                            <Image
                                src={
                                    user.image
                                        ? user.image
                                        : '/images/logo-trang.jpg'
                                }
                                alt=""
                                width={100}
                                height={100}
                                className="rounded-full"
                            ></Image>
                        </div>
                        <div className="mt-2">
                            <p>Tên người dùng: {user.userName}</p>
                            <p>Email: {user.email}</p>
                            <p>
                                Số điện thoại:{' '}
                                {user.phoneNumber
                                    ? user.phoneNumber
                                    : 'Chưa đặt'}
                            </p>
                            <p>
                                Giới tính:{' '}
                                {user.gender ? user.gender : 'Chưa đặt'}
                            </p>
                            <p>
                                Ngày sinh:{' '}
                                {user.DOB
                                    ? formatDate(
                                          new Date(user.DOB),
                                          'dd/MM/yyyy '
                                      )
                                    : 'Chưa đặt ngày sinh'}
                            </p>
                            <div>
                                {user.role === 'admin' &&
                                    'Vai trò: Quản trị viên'}
                                {user.role === 'moderator' && (
                                    <div className="">
                                        <p>Vai trò: Người kiểm duyệt</p>
                                        <button
                                            onClick={() =>
                                                handleChangeRole('user')
                                            }
                                            className=" px-2 py-1 mt-2 rounded-[10px] text-white bg-rootColor hover:bg-[#699ba3b8]"
                                        >
                                            Tước quyền kiểm duyệt
                                        </button>
                                    </div>
                                )}
                                {user.role === 'user' && (
                                    <div className="">
                                        <p>Vai trò: Người dùng</p>
                                        <button
                                            onClick={() =>
                                                handleChangeRole('moderator')
                                            }
                                            className=" px-2 py-1 mt-2 rounded-[10px] text-white bg-rootColor hover:bg-[#699ba3b8]"
                                        >
                                            Trao quyền kiểm duyệt
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Toaster position="top-right" />
        </div>
    );
}

export default InfoUser;
