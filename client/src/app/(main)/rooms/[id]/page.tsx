'use client';

import { useEffect, useState } from 'react';
import { getRoomsPersonal } from '@/api/api';
import { Room } from '@/schema/room';
import dateConvert from '@/utils/convertDate';

function RoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const [roomDetail, setRoomDetail] = useState<Room | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        const fetchRoomDetail = async () => {
            try {
                setLoading(true);

                const resolvedParams = await params;
                const { id } = resolvedParams;

                if (!id) {
                    setError("Không tìm thấy ID phòng.");
                    return;
                }

                const response = await getRoomsPersonal();

                if (response && response.data) {
                    const room = response.data.rooms.find((room: Room) => room._id === id);

                    if (room) {
                        setRoomDetail(room);
                    } else {
                        setError("Phòng không tìm thấy.");
                    }
                } else {
                    setError("Không thể tải danh sách phòng.");
                }
            } catch (error) {
                setError("Lỗi khi tải thông tin phòng.");
            } finally {
                setLoading(false);
            }
        };

        fetchRoomDetail();
    }, [params]);

    const openImageModal = (image: string) => {
        setSelectedImage(image);
    };

    const closeImageModal = () => {
        setSelectedImage(null);
    };

    if (loading) {
        return <div className="text-center text-lg">Đang tải...</div>;
    }

    if (error) {
        return <div className="text-center text-lg text-red-500">{error}</div>;
    }

    if (!roomDetail) {
        return <div className="text-center text-lg">Không có dữ liệu để hiển thị.</div>;
    }

    return (
        <div className="max-w-6xl mx-auto p-6 roboto-regular bg-white rounded-lg shadow-md flex">
            <div className="w-full lg:w-2/3 pr-6">
                <h1 className="text-3xl font-semibold mb-6 text-gray-800">{roomDetail.title}</h1>
                
                <div className="mb-6">
                    {Array.isArray(roomDetail.images) && roomDetail.images.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {roomDetail.images.map((image, index) => (
                                <div key={index} className="relative">
                                    <img
                                        src={image}
                                        alt={`Ảnh ${index + 1} của ${roomDetail.title}`}
                                        className="w-full h-auto rounded-lg cursor-pointer transition-transform transform hover:scale-105"
                                        onClick={() => openImageModal(image)}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <img
                            src="/path/to/default-image.jpg"
                            alt="Ảnh mặc định"
                            className="w-full h-auto rounded-lg"
                        />
                    )}
                </div>

                <div className="text-sm text-gray-600 space-y-2">
                    <p>Ngày đăng: {dateConvert(roomDetail.createdAt)}</p>
                    <p>Giá: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(roomDetail.price)} /tháng</p>
                    <p>Diện tích: {roomDetail.acreage} m²</p>
                    <p>Địa chỉ: {roomDetail.location.name}</p>
                </div>

                <div className="my-6">
                    <h2 className="text-xl font-semibold text-gray-800">Giới thiệu về phòng</h2>
                    <p className="text-lg mb-4 text-gray-700">{roomDetail.description}</p>
                </div>
            </div>

            <div className="w-full lg:w-1/3 bg-gray-50 p-4 rounded-lg shadow-md space-y-4 mt-6 lg:mt-0">
                <h2 className="text-xl font-semibold text-gray-800">Thông tin chủ sở hữu</h2>
                <p><strong>Chủ sở hữu:</strong> {roomDetail.ownerName}</p>
                <p><strong>Số điện thoại:</strong> {roomDetail.contactNumber}</p>
                <p><strong>Email:</strong> {roomDetail.contactEmail}</p>
            </div>

            {selectedImage && (
                <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="relative max-w-[80vw] max-h-[80vh]">
                        <img
                            src={selectedImage}
                            alt="Selected"
                            className="w-full h-auto object-contain rounded-lg shadow-lg"
                        />
                        <button
                            onClick={closeImageModal}
                            className="absolute top-4 right-4 text-white bg-black p-2 rounded-full hover:bg-red-500 transition"
                        >
                            X
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default RoomDetailPage;
