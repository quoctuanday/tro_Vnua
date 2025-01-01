'use client';
import { refuseRoommate, updateRoommate } from '@/api/api';
import { Roommate } from '@/schema/Roommate';
import Currency from '@/utils/convertCurrency';
import Image from 'next/image';
import React, { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { IoClose } from 'react-icons/io5';

interface Props {
    setFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
    roommate: Roommate | null;
}
const captions = [
    'Hình ảnh mặt tiền',
    'Phòng ngủ',
    'Nhà vệ sinh',
    'Chỗ nấu ăn',
    'Ngõ vào',
];

function InfoRoommatemate({ setFormOpen, roommate }: Props) {
    const feedbackRef = useRef<HTMLTextAreaElement>(null);
    const [error, setError] = useState('');

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
    const handleRefuse = async (id: string) => {
        if (!feedbackRef.current) return;
        const valueFeedback = feedbackRef.current.value;
        if (!valueFeedback) {
            setError('Chưa nhập phản hồi từ chối bài viết!');
            return;
        }
        const response = await refuseRoommate(id, { feedback: valueFeedback });
        if (response) {
            toast.success('Đã từ chối bài viết!');
            setFormOpen(false);
        }
    };

    return (
        <div className="fixed z-[999] top-0 left-0 bottom-0 right-0 bg-[#00000050]">
            <div className="relative h-[100vh] flex items-center justify-center">
                <div className="w-[50rem] max-h-[40rem] overflow-y-auto p-6 bg-white rounded-lg shadow-lg">
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
                        Thông tin bài viết
                    </h1>

                    {/* Roommate Information */}
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <span className="font-semibold">Tiêu đề:</span>
                            <p className="ml-2 text-gray-700">
                                {roommate?.title}
                            </p>
                        </div>
                        <div className="flex items-center">
                            <span className="font-semibold">Chủ sở hữu:</span>
                            <p className="ml-2 text-gray-700">
                                {roommate?.ownerName}
                            </p>
                        </div>
                        <div className="flex items-center">
                            <span className="font-semibold">
                                Số điện thoại liên hệ:
                            </span>
                            <p className="ml-2 text-gray-700">
                                {roommate?.contactNumber}
                            </p>
                        </div>
                        <div className="flex items-center">
                            <span className="font-semibold">
                                Email liên hệ:
                            </span>
                            <p className="ml-2 text-gray-700">
                                {roommate?.contactEmail}
                            </p>
                        </div>
                        <div className="flex items-center">
                            <span className="font-semibold">Vị trí:</span>
                            <p className="ml-2 text-gray-700">
                                {roommate?.location.name}
                            </p>
                        </div>
                        <div className="flex items-center">
                            <span className="font-semibold">Diện tích:</span>
                            <p className="ml-2 text-gray-700">
                                {roommate?.acreage} m<sup>2</sup>
                            </p>
                        </div>
                        <div className="flex items-center">
                            <span className="font-semibold">Giá:</span>
                            <p className="ml-2 text-gray-700">
                                {Currency(roommate?.price)}/tháng
                            </p>
                        </div>
                        <div>
                            <span className="font-semibold">Mô tả:</span>
                            <p className="ml-2 text-gray-700">
                                {roommate?.convenience}
                            </p>
                        </div>

                        {/* Images */}
                        <div>
                            <span className="font-semibold">Hình ảnh:</span>
                            <div className="grid grid-cols-3 gap-2">
                                {Array.isArray(roommate?.images) &&
                                    roommate?.images.map((image, index) => (
                                        <div key={index}>
                                            <Image
                                                src={image || ''}
                                                alt={`Roommate image ${
                                                    index + 1
                                                }`}
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
                    <div className="mt-2">
                        <h1 className="roboto-bold">Phản hồi:</h1>
                        <textarea
                            ref={feedbackRef}
                            name="feedback"
                            className="outline-none border rounded w-full min-h-[10rem]"
                        ></textarea>
                    </div>
                    {error && (
                        <p className="text-red-400 text-center">{error}</p>
                    )}

                    {/* Button to approve */}

                    <div className="flex items-center">
                        <button
                            onClick={() => {
                                if (roommate?._id) {
                                    handleRefuse(roommate._id);
                                }
                            }}
                            className={`mt-4 w-full py-2 px-4 rounded-md text-white ${
                                roommate?.isAvailable
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-red-500 hover:bg-red-600'
                            }`}
                            disabled={roommate?.isAvailable}
                        >
                            Từ chối duyệt
                        </button>
                        <button
                            onClick={() => handleBrowse()}
                            className={`mt-4 ml-3 w-full py-2 px-4 rounded-md text-white ${
                                roommate?.isAvailable
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-500 hover:bg-blue-600'
                            }`}
                            disabled={roommate?.isAvailable}
                        >
                            {roommate?.isAvailable
                                ? 'Bài đã duyệt'
                                : 'Duyệt bài viết'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InfoRoommatemate;
