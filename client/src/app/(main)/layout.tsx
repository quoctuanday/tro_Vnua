'use client';
import { getUser } from '@/api/api';
import { useUser } from '@/store/userData';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaHeart } from 'react-icons/fa';

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { userLoginData, setUserLoginData } = useUser();
    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
        setIsClient(true);
        const fetchData = async () => {
            try {
                const response = await getUser();
                if (response) {
                    console.log(response.data);
                    const userData = JSON.stringify(response.data);
                    localStorage.setItem('userLoginData', userData);
                    const storedUser = localStorage.getItem('userLoginData');
                    if (storedUser) {
                        setUserLoginData(JSON.parse(storedUser));
                    }
                }
            } catch (error) {
                console.log(error);
            }
        };
        fetchData();
    }, [setUserLoginData]);
    if (!isClient) {
        return null;
    }
    return (
        <div className="min-h-[80vh]">
            <div className="">
                <div className="flex items-center justify-between px-[13rem] ">
                    <Image
                        src={'/images/logo.png'}
                        alt=""
                        width={1000}
                        height={1000}
                        className="w-[8.5rem] h-[3.5rem]"
                    ></Image>
                    <div className="flex items-center roboto-bold">
                        {userLoginData ? (
                            <>
                                <FaHeart className="ml-4 text-[#de0305] hover:text-[#de03079a] cursor-pointer" />
                                <Link href={'/profile'} className="block">
                                    <Image
                                        src={
                                            userLoginData?.image
                                                ? userLoginData.image
                                                : '/images/avatar-trang.jpg'
                                        }
                                        alt=""
                                        width={100}
                                        height={100}
                                        className="w-[2rem] h-[2rem] rounded-full ml-3"
                                    ></Image>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    href={'/login'}
                                    className="block hover:underline hover:text-rootColor"
                                >
                                    Đăng nhập
                                </Link>
                                <p className="px-2">/</p>
                                <Link
                                    href={'/register'}
                                    className="block hover:underline hover:text-rootColor"
                                >
                                    Đăng ký
                                </Link>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex items-center bg-rootColor text-white px-[13rem] py-3 ">
                    <Link
                        href={'/home'}
                        className="roboto-bold block hover:underline"
                    >
                        Trang chủ
                    </Link>
                    <Link
                        href={'/rooms'}
                        className="roboto-bold ml-9 hover:underline block"
                    >
                        Cho thuê phòng
                    </Link>
                    <Link
                        href={'#'}
                        className="roboto-bold ml-9 hover:underline block"
                    >
                        Tìm người ở ghép
                    </Link>
                    <Link
                        href={'/news'}
                        className="roboto-bold ml-9 hover:underline block"
                    >
                        Tin tức
                    </Link>
                </div>
            </div>
            <div className="bg-[#efefef3f] px-[13rem]">{children}</div>
            <div className="pt-[5rem] w-full bg-[#efefef3f]"></div>
        </div>
    );
}
