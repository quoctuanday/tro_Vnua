'use client';
import { updateRoommate } from '@/api/api';
import { Roommate } from '@/schema/Roommate';
import Image from 'next/image';
import React from 'react';
import toast from 'react-hot-toast';
import { IoClose } from 'react-icons/io5';
interface Props {
    setFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
    roommate: Roommate | null;
}

function InfoRoommatemate({ setFormOpen, roommate }: Props) {
    const handleBrowse = () => {
        if (!roommate) return;
        const browseRoommate = async () => {
            const response = await updateRoommate(roommate._id, {
                isAvailable: true,
            });
            if (response) {
                toast.success('Bài đăng đã được duyệt!');
                setFormOpen(false);
            }
        };
        browseRoommate();
    };
    return (
        <div className="fixed z-[999] top-0 left-0 bottom-0 right-0">
            <div
                onClick={() => setFormOpen(false)}
                className="absolute top-0 left-0 bottom-0 right-0 opacity-50 bg-[#ccc]"
            ></div>
            <div className="relative h-[100vh] flex items-center justify-center">
                <div className="w-[50rem] max-h-[40rem] overflow-y-auto p-3 bg-white rounded">
                    <div className="flex items-center justify-end">
                        <button
                            onClick={() => setFormOpen(false)}
                            className="text-[1.4rem] rounded  hover:bg-red-400 hover:text-white"
                        >
                            <IoClose />
                        </button>
                    </div>
                    <h1 className="text-center text-[1.6rem] roboto-bold">
                        Thông tin bài viết
                    </h1>
                    <div className="mt-2">
                        <div className="flex items-center">
                            <span className="roboto-bold">Tiêu đề: </span>
                            <p className="ml-1">{roommate?.title}</p>
                        </div>
                        <div className="flex items-center">
                            <span className="roboto-bold">Chủ sở hữu: </span>
                            <p className="ml-1">{roommate?.ownerName}</p>
                        </div>
                        <div className="flex items-center">
                            <span className="roboto-bold">
                                Số điện thoại liên hệ:{' '}
                            </span>
                            <p className="ml-1">{roommate?.contactNumber}</p>
                        </div>
                        <div className="flex items-center">
                            <span className="roboto-bold">Email liên hệ: </span>
                            <p className="ml-1">{roommate?.contactEmail}</p>
                        </div>
                        <div className="">
                            <span className="roboto-bold">Mô tả: </span>
                            <p className="">{roommate?.description}</p>
                        </div>
                        <div className="flex items-center">
                            <span className="roboto-bold">Vị trí: </span>
                            <p className="ml-1">{roommate?.location.name}</p>
                        </div>
                        <div className="flex items-center">
                            <span className="roboto-bold">Diện tích: </span>
                            <p className="ml-1">{roommate?.acreage}</p>
                        </div>
                        <div className="flex items-center">
                            <span className="roboto-bold">Giá: </span>
                            <p className="ml-1">{roommate?.price}</p>
                        </div>
                        <div className="">
                            <span className="roboto-bold">Hình ảnh:</span>
                            <div className="grid grid-cols-3">
                                {Array.isArray(roommate?.images) &&
                                    roommate?.images.map((image, index) => (
                                        <div className="col-span-1" key={index}>
                                            <Image
                                                src={image ? image : ''}
                                                alt=""
                                                width={100}
                                                height={100}
                                                className="w-full max-h-[12rem]"
                                            />
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => handleBrowse()}
                        className={`mt-2 px-2 py-1 rounded-[10px] ${
                            roommate?.isAvailable
                                ? 'bg-[#ccc] text-[#999] cursor-not-allowed'
                                : 'bg-rootColor hover:bg-[#699ba3] text-white'
                        }`}
                    >
                        Duyệt bài viết
                    </button>
                </div>
            </div>
        </div>
    );
}

export default InfoRoommatemate;
