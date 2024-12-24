'use client';

import { useEffect, useState } from 'react';
import { createComment, getAllRooms, getComment } from '@/api/api';
import { Room } from '@/schema/room';
import { Comments } from '@/schema/Comment';
import dateConvert from '@/utils/convertDate';
import Image from 'next/image';
import { Controller, useForm } from 'react-hook-form';
import { FaRegStar, FaStar } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import { useUser } from '@/store/userData';
import CustomerMap from '@/components/Map';
import Link from 'next/link';
import Carousel from '@/components/carousel';

interface Comment {
    roomId: string;
    content: string;
    rate: number;
}
type Coordinates = {
    latitude: number;
    longitude: number;
} | null;

function RoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { socket, userLoginData } = useUser();
    const [userComment, setUserComment] = useState<Comments | null>(null);
    const [comment, setComment] = useState<Comments[]>([]);
    const { register, handleSubmit, control, reset } = useForm<Comment>();
    const [roomId, setRoomId] = useState('');
    const [roomDetail, setRoomDetail] = useState<Room | null>(null);
    const [coord, setCoord] = useState<Coordinates | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRoomDetail = async () => {
            try {
                setLoading(true);

                const resolvedParams = await params;
                const { id } = resolvedParams;

                if (!id) {
                    setError('Không tìm thấy ID phòng.');
                    return;
                }
                setRoomId(id);

                const response = await getAllRooms();

                if (response && response.data) {
                    const data = response.data.formattedRooms;
                    const availableRooms = data.filter(
                        (room: Room) => room.isAvailable
                    );
                    const room = availableRooms.find(
                        (room: Room) => room._id === id
                    );

                    if (room) {
                        setRoomDetail(room);
                    } else {
                        setError('Phòng không tìm thấy.');
                    }
                } else {
                    setError('Không thể tải danh sách phòng.');
                }
            } catch (error) {
                console.log(error);
                setError('Lỗi khi tải thông tin phòng.');
            } finally {
                setLoading(false);
            }
        };
        fetchRoomDetail();

        const getComments = async () => {
            const resolvedParams = await params;
            const { id } = resolvedParams;
            const response = await getComment(id, true);
            if (response) {
                console.log(response.data.comment);
                setComment(response.data.comment);
            }
        };
        getComments();

        if (!socket) return;
        socket.on('room-update', () => {
            console.log('Room updated');
            fetchRoomDetail();
        });
        socket.on('comment-update', () => {
            getComments();
        });
    }, [params, socket]);

    useEffect(() => {
        if (userLoginData && comment) {
            const userCmt = comment.find(
                (comment) => comment.userId === userLoginData._id
            );
            setUserComment(userCmt || null);
        }
    }, [comment, userLoginData]);

    const onSubmit = async (data: Comment) => {
        data.roomId = roomId;
        console.log(data);

        const response = await createComment({ data, type: true });
        if (response) {
            toast.success('Bình luận thành công!');
            reset();
        }
    };

    if (loading) {
        return <div className="text-center text-lg">Đang tải...</div>;
    }

    if (error) {
        return <div className="text-center text-lg text-red-500">{error}</div>;
    }

    if (!roomDetail) {
        return (
            <div className="text-center text-lg">
                Không có dữ liệu để hiển thị.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-3 roboto-regular p-3 bg-white rounded-lg shadow-md">
            <div className="col-span-2 w-full  pr-6">
                <Carousel
                    images={
                        Array.isArray(roomDetail.images)
                            ? roomDetail.images
                            : []
                    }
                    title={roomDetail.title}
                />

                <h1 className="text-3xl font-semibold mb-6 text-gray-800">
                    {roomDetail.title}
                </h1>
                <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
                    <p className="text-sm text-gray-600">
                        <span className="font-semibold">Ngày đăng:</span>{' '}
                        {dateConvert(roomDetail.createdAt)}
                    </p>

                    <div className="flex items-center space-x-3 text-base text-gray-600">
                        <p className="flex items-center space-x-1">
                            <span className="font-semibold">Giá:</span>
                            <span>
                                {new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND',
                                }).format(roomDetail.price)}{' '}
                                /tháng
                            </span>
                        </p>
                        <p className="flex items-center space-x-1">
                            <span className="font-semibold">Diện tích:</span>
                            <span>{roomDetail.acreage} m²</span>
                        </p>
                    </div>

                    <p className="text-base text-gray-600">
                        <span className="font-semibold">Địa chỉ:</span>{' '}
                        {roomDetail.location.name}
                    </p>
                </div>

                <CustomerMap
                    latitude={roomDetail.location.coordinates.latitude}
                    longitude={roomDetail.location.coordinates.longitude}
                    setCoord={setCoord}
                />

                <div className="my-6">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Thông tin mô tả
                    </h2>
                    <p className="text-lg mb-4 text-gray-700 whitespace-pre-line leading-relaxed">
                        {roomDetail.description}
                    </p>
                </div>

                <div className="mt-3">
                    <h1 className="roboto-bold">Bình luận và đánh giá</h1>

                    {userComment ? (
                        <div className="mt-1">
                            <h1 className="roboto-bold">Bình luận của bạn</h1>
                            <div className="flex mt-3">
                                <Image
                                    src={
                                        userComment.image
                                            ? userComment.image
                                            : '/images/avatar-trang.jpg'
                                    }
                                    alt=""
                                    width={100}
                                    height={100}
                                    className="rounded-full w-[3rem] h-[3rem]"
                                ></Image>

                                <div className="flex flex-col ml-2">
                                    <p className="roboto-bold">
                                        {userComment.userName}
                                    </p>
                                    <div className="flex items-center mt-1">
                                        {Array.from({ length: 5 }).map(
                                            (_, index) =>
                                                index <
                                                (userComment?.rate || 0) ? (
                                                    <FaStar
                                                        key={index}
                                                        className="text-yellow-500 text-[1rem] mr-1"
                                                    />
                                                ) : (
                                                    <FaRegStar
                                                        key={index}
                                                        className="text-gray-400 text-[1rem] mr-1"
                                                    />
                                                )
                                        )}
                                    </div>
                                    <p className="mt-2 whitespace-pre-line">
                                        {userComment.content}
                                    </p>
                                    <span className="roboto-thin">
                                        {dateConvert(userComment.createdAt)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="">
                            {userLoginData ? (
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <div className="mt-2">
                                        <label className="roboto-bold">
                                            Bình luận:
                                        </label>
                                        <textarea
                                            {...register('content', {
                                                required: true,
                                            })}
                                            name="content"
                                            className="w-full h-[10rem] border-[1px] overflow-y-auto rounded outline-none"
                                        ></textarea>
                                    </div>
                                    <div className="mt-2">
                                        <label className="roboto-bold">
                                            Đánh giá
                                        </label>
                                        <Controller
                                            name="rate"
                                            control={control}
                                            render={({
                                                field: { onChange, value },
                                            }) => (
                                                <div className="flex mt-1">
                                                    {[1, 2, 3, 4, 5].map(
                                                        (starValue) => (
                                                            <span
                                                                key={starValue}
                                                                className={`text-[2rem] cursor-pointer ml-1 ${
                                                                    starValue <=
                                                                    value
                                                                        ? 'text-yellow-400'
                                                                        : 'text-gray-400'
                                                                }`}
                                                                onClick={() =>
                                                                    onChange(
                                                                        starValue
                                                                    )
                                                                } // Cập nhật giá trị khi click
                                                            >
                                                                {starValue <=
                                                                value ? (
                                                                    <FaStar />
                                                                ) : (
                                                                    <FaRegStar />
                                                                )}
                                                            </span>
                                                        )
                                                    )}
                                                </div>
                                            )}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="px-2 py-1 bg-rootColor text-white mt-3 rounded"
                                    >
                                        Gửi bình luận
                                    </button>
                                </form>
                            ) : (
                                <div className="">
                                    Bạn chưa đăng nhập. Mời bạn đăng nhập
                                    <Link
                                        className="text-blue-400 underline cursor-pointer"
                                        href={'/login'}
                                    >
                                        {' '}
                                        tại đây!
                                    </Link>{' '}
                                    Nếu bạn chưa có tài khoản, đăng ký
                                    <Link
                                        className="text-blue-400 underline cursor-pointer"
                                        href={'/register'}
                                    >
                                        {' '}
                                        tại đây!
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                    <h1 className="roboto-bold mt-3">Các bình luận </h1>
                    {comment.map((comment) => (
                        <div className="flex mt-3" key={comment._id}>
                            <Image
                                src={
                                    comment.image
                                        ? comment.image
                                        : '/images/avatar-trang.jpg'
                                }
                                alt=""
                                width={100}
                                height={100}
                                className="rounded-full w-[3rem] h-[3rem]"
                            ></Image>

                            <div className="flex flex-col ml-2">
                                <p className="roboto-bold">
                                    {comment.userName}
                                </p>
                                <div className="flex items-center mt-1">
                                    {Array.from({ length: 5 }).map((_, index) =>
                                        index < (comment?.rate || 0) ? (
                                            <FaStar
                                                key={index}
                                                className="text-yellow-500 text-[1rem] mr-1"
                                            />
                                        ) : (
                                            <FaRegStar
                                                key={index}
                                                className="text-gray-400 text-[1rem] mr-1"
                                            />
                                        )
                                    )}
                                </div>
                                <p className="mt-2 whitespace-pre-line">
                                    {comment.content}
                                </p>
                                <span className="roboto-thin">
                                    {dateConvert(comment.createdAt)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="col-span-1 w-full bg-gray-50 p-6 rounded-lg shadow-md space-y-4 mt-6 lg:mt-0">
                <h2 className="text-2xl font-semibold text-gray-800">
                    Thông tin chủ sở hữu
                </h2>
                <div className="text-lg text-gray-700 space-y-2">
                    <p>
                        <strong className="font-bold">Chủ sở hữu:</strong>{' '}
                        {roomDetail.ownerName}
                    </p>
                    <p>
                        <strong className="font-bold">Số điện thoại:</strong>{' '}
                        <a
                            href={`tel:${roomDetail.contactNumber}`}
                            className="text-blue-600"
                        >
                            {roomDetail.contactNumber}
                        </a>
                    </p>
                    <p>
                        <strong className="font-bold">Email:</strong>{' '}
                        <a
                            href={`mailto:${roomDetail.contactEmail}`}
                            className="text-blue-600"
                        >
                            {roomDetail.contactEmail}
                        </a>
                    </p>
                </div>
            </div>

            <Toaster position="top-right" />
        </div>
    );
}

export default RoomDetailPage;
