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
                toast.error('Có lỗi xảy ra, vui lòng thử lại.');
            }
        };
        updateRole();
    };

    if (!user) return null;

    return (
        <div className="fixed z-[999] top-0 left-0 bottom-0 right-0 bg-[#00000050]">
            <div className="relative h-[100vh] flex items-center justify-center">
                <div className="w-[30rem] h-[40rem] p-6 bg-white rounded-lg shadow-lg overflow-y-auto">
                    {/* Close button */}
                    <div className="flex items-center justify-end">
                        <button
                            onClick={() => setFormOpen(false)}
                            className="text-[1.6rem] text-gray-600 hover:text-red-500"
                        >
                            <IoClose />
                        </button>
                    </div>

                    {/* Title */}
                    <h1 className="text-center text-2xl font-bold text-gray-800 mb-4">
                        Thông tin người dùng
                    </h1>

                    {/* User Avatar */}
                    <div className="flex justify-center">
                        <Image
                            src={user.image || '/images/logo-trang.jpg'}
                            alt="User Avatar"
                            width={120}
                            height={120}
                            className="rounded-full"
                        />
                    </div>

                    {/* User Information */}
                    <div className="mt-4">
                        <div className="space-y-2">
                            <p className="text-lg font-semibold">Tên người dùng: <span className="text-gray-700">{user.userName}</span></p>
                            <p className="text-lg font-semibold">Email: <span className="text-gray-700">{user.email}</span></p>
                            <p className="text-lg font-semibold">Số điện thoại: <span className="text-gray-700">{user.phoneNumber || 'Chưa đặt'}</span></p>
                            <p className="text-lg font-semibold">Giới tính: <span className="text-gray-700">{user.gender || 'Chưa đặt'}</span></p>
                            <p className="text-lg font-semibold">Ngày sinh: <span className="text-gray-700">{user.DOB ? formatDate(new Date(user.DOB), 'dd/MM/yyyy') : 'Chưa đặt ngày sinh'}</span></p>
                        </div>

                        {/* User Role */}
                        <div className="mt-4">
                            <h2 className="text-xl font-semibold">Vai trò:</h2>
                            <div className="mt-2">
                                {user.role === 'admin' && <p className="text-lg">Quản trị viên</p>}
                                {user.role === 'moderator' && (
                                    <div>
                                        <p className="text-lg">Người kiểm duyệt</p>
                                        <button
                                            onClick={() => handleChangeRole('user')}
                                            className="mt-2 w-full py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600"
                                        >
                                            Tước quyền kiểm duyệt
                                        </button>
                                    </div>
                                )}
                                {user.role === 'user' && (
                                    <div>
                                        <p className="text-lg">Người dùng</p>
                                        <button
                                            onClick={() => handleChangeRole('moderator')}
                                            className="mt-2 w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600"
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
