'use client';
import { useUser } from '@/store/userData';
import Link from 'next/link';
import React from 'react';
import { FaSpinner } from 'react-icons/fa';
import { HiMiniPencilSquare } from 'react-icons/hi2';

function ProfilePage() {
    const { userLoginData } = useUser();

    if (userLoginData)
        return (
            <div className="p-[1.3rem]">
                <div className="roboto-bold text-[1.3rem] flex items-center">
                    <h1>Thông tin cá nhân</h1>
                    <Link href={'/profile/edit'}>
                        <HiMiniPencilSquare className="ml-2 hover:text-rootColor" />
                    </Link>
                </div>
                <div className="mt-[0.6rem] roboto-regular flex">
                    <h2 className=" roboto-bold">Tên người dùng: </h2>
                    <p className="ml-2"> {userLoginData.userName}</p>
                </div>
                {userLoginData.DOB && (
                    <div className="mt-[0.6rem] roboto-regular flex">
                        <h2 className=" roboto-bold">Ngày sinh: </h2>
                        <p className="ml-2">
                            {' '}
                            {userLoginData.DOB instanceof Date
                                ? userLoginData.DOB.toLocaleDateString()
                                : new Date(
                                      userLoginData.DOB
                                  ).toLocaleDateString()}
                        </p>
                    </div>
                )}
                {userLoginData.gender && (
                    <div className="mt-[0.6rem] roboto-regular flex">
                        <h2 className=" roboto-bold">Giới tính: </h2>
                        <p className="ml-2"> {userLoginData.gender}</p>
                    </div>
                )}
                <div className="mt-[0.6rem] roboto-regular flex">
                    <h2 className=" roboto-bold">Email: </h2>
                    <p className="ml-2"> {userLoginData.email}</p>
                </div>
                {userLoginData.phoneNumber && (
                    <div className="mt-[0.6rem] roboto-regular flex">
                        <h2 className=" roboto-bold">Số điện thoại: </h2>
                        <p className="ml-2"> {userLoginData.phoneNumber}</p>
                    </div>
                )}
            </div>
        );
    return (
        <div className="flex items-center justify-center">
            <FaSpinner className="spin" />
        </div>
    );
}

export default ProfilePage;
