'use client';
import { updateRoom } from '@/api/api';
import { Room } from '@/schema/room';
import Image from 'next/image';
import React from 'react';
import toast from 'react-hot-toast';
import { IoClose } from 'react-icons/io5';

interface Props {
    setFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
    room: Room | null;
}
const captions = [
    'Hình ảnh mặt tiền',
    'Phòng ngủ',
    'Nhà vệ sinh',
    'Chỗ nấu ăn',
    'Ngõ vào',
];

function InfoRoom({ setFormOpen, room }: Props) {
    const handleBrowse = () => {
        if (!room) return;
        const browseRoom = async () => {
            const response = await updateRoom(room._id, { isAvailable: true });
            if (response) {
                toast.success('Bài đăng đã được duyệt!');
                setFormOpen(false);
            }
        };
        browseRoom();
    };

    return (
        <div className="fixed z-[999] top-0 left-0 bottom-0 right-0 bg-[#00000050]">
            <div className="relative h-[100vh] flex items-center justify-center">
                <div className="w-[50rem] max-h-[40rem] overflow-y-auto p-6 bg-white rounded-lg shadow-lg">
                    {/* Close Button */}
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
                        Thông tin phòng trọ
                    </h1>

                    {/* Room Information */}
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <span className="font-semibold">Tiêu đề:</span>
                            <p className="ml-2 text-gray-700">{room?.title}</p>
                        </div>
                        <div className="flex items-center">
                            <span className="font-semibold">Chủ sở hữu:</span>
                            <p className="ml-2 text-gray-700">
                                {room?.ownerName}
                            </p>
                        </div>
                        <div className="flex items-center">
                            <span className="font-semibold">
                                Số điện thoại liên hệ:
                            </span>
                            <p className="ml-2 text-gray-700">
                                {room?.contactNumber}
                            </p>
                        </div>
                        <div className="flex items-center">
                            <span className="font-semibold">
                                Email liên hệ:
                            </span>
                            <p className="ml-2 text-gray-700">
                                {room?.contactEmail}
                            </p>
                        </div>
                        <div className="flex items-center">
                            <span className="font-semibold">Vị trí:</span>
                            <p className="ml-2 text-gray-700">
                                {room?.location.name}
                            </p>
                        </div>
                        <div className="flex items-center">
                            <span className="font-semibold">Diện tích:</span>
                            <p className="ml-2 text-gray-700">
                                {room?.acreage}
                            </p>
                        </div>
                        <div className="flex items-center">
                            <span className="font-semibold">Giá:</span>
                            <p className="ml-2 text-gray-700">{room?.price}</p>
                        </div>
                        <div>
                            <span className="font-semibold">Mô tả:</span>
                            <p className="ml-2 text-gray-700">
                                {room?.description}
                            </p>
                        </div>

                        {/* Images */}
                        <div>
                            <span className="font-semibold">Hình ảnh:</span>
                            <div className="grid grid-cols-3 gap-2">
                                {Array.isArray(room?.images) &&
                                    room?.images.map((image, index) => (
                                        <div key={index}>
                                            <Image
                                                src={image || ''}
                                                alt={`Room image ${index + 1}`}
                                                width={100}
                                                height={100}
                                                className="w-full max-h-[12rem] object-cover rounded-lg"
                                            />
                                            <p className="text-center">
                                                {captions[index]}
                                            </p>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>

                    {/* Button to approve */}
                    <button
                        onClick={() => handleBrowse()}
                        className={`mt-4 w-full py-2 px-4 rounded-md text-white ${
                            room?.isAvailable
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-500 hover:bg-blue-600'
                        }`}
                        disabled={room?.isAvailable}
                    >
                        {room?.isAvailable ? 'Bài đã duyệt' : 'Duyệt bài viết'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default InfoRoom;
