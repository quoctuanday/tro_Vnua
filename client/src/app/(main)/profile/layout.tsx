'use client';
import { useUser } from '@/store/userData';
import Image from 'next/image';
import Link from 'next/link';
import React, { useRef, useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../firebase/config';
import toast, { Toaster } from 'react-hot-toast';
import { logout, updateProfile } from '@/api/api';
import { FaSpinner } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { MdAdminPanelSettings } from 'react-icons/md';
import { TbJewishStarFilled } from 'react-icons/tb';

export default function ProfileLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const router = useRouter();
    const { setUserLoginData } = useUser();
    //Image upload
    const [changeImage, setChangeImage] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [visibleFormImage, setVisileFormImage] = useState(false);
    const inputUploadImage = useRef<HTMLInputElement>(null);

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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        const maxSizeInMB = 2;
        const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
        if (file) {
            if (file.size > maxSizeInBytes) {
                toast.error('Kích thước ảnh lớn hơn 2Mb. Mời chọn lại!');
                return;
            }
            setFile(file);
            setChangeImage(URL.createObjectURL(file));
        }
    };

    const handleSelectImage = () => {
        if (inputUploadImage.current) {
            inputUploadImage.current.click();
        }
    };

    const handleUploadImage = async () => {
        if (!file) {
            toast.error('Chưa chọn ảnh kìa!');
            return;
        }
        setUploading(true);
        const storageRef = ref(
            storage,
            `troVnua/${userLoginData?.userName}/avatar`
        );
        console.log('Uploaded image successfully');
        try {
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            try {
                if (!userLoginData?._id) return;
                const response = await updateProfile({
                    image: url,
                });

                if (response.status === 200) {
                    if (userLoginData) {
                        const updatedUser = { ...userLoginData, image: url };
                        localStorage.setItem(
                            'userLoginData',
                            JSON.stringify(updatedUser)
                        );
                        setUserLoginData(updatedUser);
                    }
                    toast.success('Đổi avatar thành công!');
                }
            } catch (error) {
                console.log('Lỗi upload hình ảnh: ', error);
                toast.error('Đổi avt thất bại');
            }
        } catch (error) {
            console.log('uploaded image error', error);
        } finally {
            if (inputUploadImage.current) {
                inputUploadImage.current.value = '';
            }
            setFile(null);
            setUploading(false);
            setVisileFormImage(false);
        }
    };

    const { userLoginData } = useUser();
    if (!userLoginData) return;
    return (
        <div className="bg-[#efefef3f] h-full">
            <div className="grid grid-cols-6 gap-4 py-[1.3rem] ">
                <div className="col-span-2 min-h-[20rem] ">
                    <div className="text-center border-b-[1px] pb-[1.3rem]">
                        <div className="flex justify-center relative">
                            <div className="relative">
                                <Image
                                    src={
                                        userLoginData && userLoginData.image
                                            ? userLoginData.image
                                            : '/images/avatar-trang.jpg'
                                    }
                                    alt=""
                                    width={100}
                                    height={100}
                                    className="w-[5rem] h-[5rem] rounded-full border-2"
                                    onClick={() =>
                                        setVisileFormImage(!visibleFormImage)
                                    }
                                ></Image>
                                {userLoginData.role === 'admin' && (
                                    <MdAdminPanelSettings className="absolute text-[1.2rem] bottom-1 right-1 text-blue-800" />
                                )}

                                {userLoginData.role === 'moderator' && (
                                    <TbJewishStarFilled className="absolute text-[1.2rem] bottom-1 right-1 text-yellow-500" />
                                )}

                                {uploading && (
                                    <div className="absolute top-0  w-[5rem] h-[5rem] bg-[#ccc] text-white opacity-50 flex items-center justify-center rounded-full">
                                        <FaSpinner className="spin" />
                                    </div>
                                )}
                            </div>
                            {visibleFormImage ? (
                                <>
                                    <div className="min-w-[10rem] min-h-[4rem] p-[1.3rem]  absolute top-[110%] bg-white rounded border-2 flex flex-col items-center justify-center">
                                        <input
                                            ref={inputUploadImage}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageChange}
                                        />
                                        {changeImage && (
                                            <>
                                                <div className="">
                                                    <Image
                                                        src={changeImage}
                                                        alt=""
                                                        width={100}
                                                        height={100}
                                                        className="w-[6rem] h-[6rem]"
                                                    ></Image>
                                                </div>
                                            </>
                                        )}
                                        <div className="mt-3 flex items-center">
                                            <button
                                                onClick={handleSelectImage}
                                                className="roboto-regular px-2 py-1 rounded-[0.6rem] bg-rootColor text-white hover:bg-[#699ba3c1]"
                                            >
                                                Chọn ảnh
                                            </button>
                                            <button
                                                onClick={handleUploadImage}
                                                className="roboto-regular ml-3  px-2 py-1 rounded-[0.6rem] bg-rootColor text-white hover:bg-[#699ba3c1]"
                                            >
                                                Tải ảnh lên
                                            </button>
                                        </div>
                                        <p className="mt-2 roboto-light-italic ">
                                            Kích thước ảnh không vượt quá 2Mb
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <></>
                            )}
                        </div>
                        <p className="roboto-bold ml-3 text-xl mt-2">
                            {userLoginData.userName}
                        </p>
                    </div>
                    <div className="mt-[1.3rem] roboto-bold text-[1.1rem]">
                        <Link
                            href={'/profile'}
                            className="block py-1 hover:bg-rootColor hover:text-white rounded pl-2 cursor-pointer"
                        >
                            Tài khoản của tôi
                        </Link>
                        <Link
                            href={'/profile/listRoom'}
                            className="block py-1 hover:bg-rootColor hover:text-white rounded pl-2 cursor-pointer"
                        >
                            Bài đăng thuê trọ
                        </Link>
                        <Link
                            href={'/profile/roommateFinder'}
                            className="block py-1 hover:bg-rootColor hover:text-white rounded pl-2 cursor-pointer"
                        >
                            Tìm người ở ghép
                        </Link>
                        {(userLoginData.role === 'admin' ||
                            userLoginData.role === 'moderator') && (
                            <Link
                                href={'/profile/postNews'}
                                className="block py-1 hover:bg-rootColor hover:text-white rounded pl-2 cursor-pointer"
                            >
                                Bài đăng tin tức
                            </Link>
                        )}
                        {(userLoginData.role === 'admin' ||
                            userLoginData.role === 'moderator') && (
                            <Link
                                href={'/admin'}
                                className="block py-1 hover:bg-rootColor hover:text-white rounded pl-2 cursor-pointer"
                            >
                                Dashboard Admin
                            </Link>
                        )}
                        <div
                            onClick={handleLogOut}
                            className="py-1 hover:bg-rootColor hover:text-white rounded pl-2 cursor-pointer"
                        >
                            Đăng xuất
                        </div>
                    </div>
                </div>
                <div
                    className="col-span-4 min-h-[20rem] max-h-[33rem] overflow-y-auto bg-white rounded-[0.6rem] shadow-custom-light 
                    [&::-webkit-scrollbar]:w-2
                    [&::-webkit-scrollbar-track]:rounded-[10px]
                    [&::-webkit-scrollbar-track]:bg-gray-100
                    [&::-webkit-scrollbar-thumb]:rounded-[10px]
                    [&::-webkit-scrollbar-thumb]:bg-gray-300
                    "
                >
                    {children}
                </div>
            </div>
            <Toaster position="top-right" />
        </div>
    );
}
