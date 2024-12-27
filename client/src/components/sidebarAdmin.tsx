'use client';
import { logout } from '@/api/api';
import { useUser } from '@/store/userData';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
    LuAlignEndHorizontal,
    LuFile,
    LuHome,
    LuList,
    LuLogOut,
    LuUser2,
} from 'react-icons/lu';

function SidebarAdmin() {
    const { userLoginData } = useUser();
    const pathName = usePathname();

    const [active, setActive] = useState(pathName);
    const handleClickPath = (path: string) => {
        setActive(path);
    };

    const router = useRouter();

    const handleLogOut = () => {
        const logOut = async () => {
            try {
                const response = await logout();
                if (response) {
                    localStorage.clear();
                    toast.success('Đã đăng xuất');
                    setTimeout(() => {
                        router.push('/login');
                    }, 2000);
                }
            } catch (error) {
                console.log(error);
            }
        };
        logOut();
    };
    return (
        <div className="bg-white roboto-bold border-[1px] text-[1.1rem]  h-[100vh] px-3 pt-3">
            <Image
                src="/images/logo.png"
                alt=""
                width={300}
                height={300}
                className="w-[9.5rem] h-[4rem]"
            ></Image>
            <div className="mt-3">
                <h2 className="text-rootColor">Chức năng chính</h2>
                <ul className="mt-3">
                    {userLoginData?.role === 'admin' && (
                        <Link
                            href={'/admin/manageUser'}
                            className={`${
                                active == '/admin/manageUser' &&
                                'text-rootColor'
                            } hover:text-rootColor cursor-pointer flex items-center`}
                            onClick={() => {
                                handleClickPath('/admin/manageUser');
                            }}
                        >
                            <LuUser2 className="pr-1" />
                            Quản lí tài khoản
                        </Link>
                    )}
                    <Link
                        href={'/admin/managePost'}
                        className={`${
                            active == '/admin/managePost' && 'text-rootColor'
                        } hover:text-rootColor mt-2 cursor-pointer flex items-center`}
                        onClick={() => {
                            handleClickPath('/admin/managePost');
                        }}
                    >
                        <LuFile className="pr-1" />
                        Quản lí cho thuê phòng
                    </Link>
                    <Link
                        href={'/admin/manageRoommate'}
                        className={`${
                            active == '/admin/manageRoommate' &&
                            'text-rootColor'
                        } hover:text-rootColor mt-2 cursor-pointer flex items-center`}
                        onClick={() => {
                            handleClickPath('/admin/manageRoommate');
                        }}
                    >
                        <LuFile className="pr-1" />
                        Quản lí tìm người ở ghép
                    </Link>
                    <Link
                        href={'/admin/manageCategory'}
                        className={`${
                            active == '/admin/manageCategory' &&
                            'text-rootColor'
                        } hover:text-rootColor mt-2 cursor-pointer flex items-center`}
                        onClick={() => {
                            handleClickPath('/admin/manageCategory');
                        }}
                    >
                        <LuList className="pr-1" />
                        Quản lí danh mục
                    </Link>
                    <Link
                        href={'/admin'}
                        className={`${
                            active == '/admin' && 'text-rootColor'
                        } hover:text-rootColor mt-2 cursor-pointer flex items-center`}
                        onClick={() => {
                            handleClickPath('/admin');
                        }}
                    >
                        <LuAlignEndHorizontal className="pr-1" />
                        Thống kê
                    </Link>
                </ul>
                <h2 className="mt-3 text-rootColor">Thông tin tài khoản</h2>
                <ul className="mt-3">
                    <Link
                        href={'/home'}
                        className="hover:text-rootColor cursor-pointer flex items-center"
                    >
                        <LuHome className="pr-1" />
                        Trang chủ
                    </Link>
                    <button
                        onClick={handleLogOut}
                        className="mt-2 hover:text-rootColor cursor-pointer flex items-center"
                    >
                        <LuLogOut className="pr-1" />
                        Đăng xuất
                    </button>
                </ul>
                <div className="flex items-center mt-3">
                    <Image
                        src={
                            userLoginData?.image
                                ? userLoginData.image
                                : '/images/avatar-trang.jpg'
                        }
                        alt=""
                        width={100}
                        height={100}
                        className="rounded-full w-[3.5rem]"
                    ></Image>
                    <div className="ml-2">
                        <p className="">{userLoginData?.userName}</p>
                        {userLoginData?.role === 'admin' && (
                            <p className="text-[0.9rem] roboto-regular">
                                Quản trị viên
                            </p>
                        )}
                        {userLoginData?.role === 'moderator' && (
                            <p className="text-[0.9rem] roboto-regular">
                                Người kiểm duyệt
                            </p>
                        )}
                    </div>
                </div>
            </div>
            <Toaster position="top-right" />
        </div>
    );
}

export default SidebarAdmin;
