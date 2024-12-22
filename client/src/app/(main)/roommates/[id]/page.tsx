'use client';

import { useEffect, useState } from 'react';
import { createComment, getAllRoommates, getComment } from '@/api/api';
import { Comments } from '@/schema/Comment';
import dateConvert from '@/utils/convertDate';
import Image from 'next/image';
import { Controller, useForm } from 'react-hook-form';
import { FaRegStar, FaStar } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import { useUser } from '@/store/userData';
import CustomerMap from '@/components/Map';
import { Roommate } from '@/schema/Roommate';
import Link from 'next/link';

interface Comment {
    roommateId: string;
    content: string;
    rate: number;
}
type Coordinates = {
    latitude: number;
    longitude: number;
} | null;

function RoommateDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { socket, userLoginData } = useUser();
    const [userComment, setUserComment] = useState<Comments | null>(null);
    const [comment, setComment] = useState<Comments[]>([]);
    const { register, handleSubmit, control, reset } = useForm<Comment>();
    const [roommateId, setRoommateId] = useState('');
    const [roommateDetail, setRoommateDetail] = useState<Roommate | null>(null);
    const [coord, setCoord] = useState<Coordinates | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        const fetchRoommateDetail = async () => {
            try {
                setLoading(true);

                const resolvedParams = await params;
                const { id } = resolvedParams;

                if (!id) {
                    setError('Không tìm thấy ID phòng.');
                    return;
                }
                setRoommateId(id);

                const response = await getAllRoommates();

                if (response && response.data) {
                    const data = response.data.formattedRoommates;
                    const availableRoommates = data.filter(
                        (roommate: Roommate) => roommate.isAvailable
                    );
                    const roommate = availableRoommates.find(
                        (roommate: Roommate) => roommate._id === id
                    );

                    if (roommate) {
                        setRoommateDetail(roommate);
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
        fetchRoommateDetail();

        const getComments = async () => {
            const resolvedParams = await params;
            const { id } = resolvedParams;
            const response = await getComment(id, false);
            if (response && response.data.comment) {
                const data = response.data.comment;
                const filcomment = data.filter(
                    (prev: Comments) => prev.roommateId
                );
                setComment(filcomment);
            }
        };
        getComments();

        if (!socket) return;
        socket.on('roommate-update', () => {
            console.log('Roommate updated');
            fetchRoommateDetail();
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

    const openImageModal = (image: string) => {
        setSelectedImage(image);
    };

    const closeImageModal = () => {
        setSelectedImage(null);
        console.log(coord);
    };

    const onSubmit = async (data: Comment) => {
        data.roommateId = roommateId;
        console.log(data);

        const response = await createComment({ data, type: false });
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

    if (!roommateDetail) {
        return (
            <div className="text-center text-lg">
                Không có dữ liệu để hiển thị.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-3 roboto-regular p-3 bg-white rounded-lg shadow-md">
            <div className="col-span-2 w-full  pr-6">
                <h1 className="text-3xl font-semibold mb-6 text-gray-800">
                    {roommateDetail.title}
                </h1>

                <div className="mb-6">
                    {Array.isArray(roommateDetail.images) &&
                    roommateDetail.images.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                            {roommateDetail.images.map((image, index) => (
                                <div key={index} className="relative">
                                    <Image
                                        src={image}
                                        alt={`Ảnh ${index + 1} của ${
                                            roommateDetail.title
                                        }`}
                                        width={100}
                                        height={100}
                                        className="h-[15rem] w-auto  rounded-lg cursor-pointer transition-transform transform hover:scale-105"
                                        onClick={() => openImageModal(image)}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Image
                            src="/path/to/default-image.jpg"
                            alt="Ảnh mặc định"
                            width={100}
                            height={100}
                            className="w-full h-auto rounded-lg"
                        />
                    )}
                </div>

                <div className="text-sm text-gray-600 space-y-2">
                    <p>Ngày đăng: {dateConvert(roommateDetail.createdAt)}</p>
                    <p>
                        Giá:{' '}
                        {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                        }).format(roommateDetail.price)}{' '}
                        /tháng
                    </p>
                    <p>Diện tích: {roommateDetail.acreage} m²</p>
                    <p>Địa chỉ: {roommateDetail.location.name}</p>
                </div>
                <CustomerMap
                    latitude={roommateDetail.location.coordinates.latitude}
                    longitude={roommateDetail.location.coordinates.longitude}
                    setCoord={setCoord}
                />

                <div className="my-6">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Giới thiệu về phòng
                    </h2>
                    <h1 className="roboto-bold">Tiện nghi:</h1>
                    <p className="whitespace-pre-line">
                        {' '}
                        {roommateDetail.convenience}
                    </p>
                    <div className="flex items-center">
                        <h1 className="roboto-bold">Yêu cầu:</h1>
                        <p className=" text-gray-700 whitespace-pre-line ml-1">
                            giới tính: {roommateDetail.require.gender}, độ tuổi:
                            từ {roommateDetail.require.age.min} đến{' '}
                            {roommateDetail.require.age.max}, số người{' '}
                            {roommateDetail.numberOfPeople}.
                        </p>
                        <p className="  text-gray-700 whitespace-pre-line"></p>
                    </div>
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

            <div className="col-span-1 w-full bg-gray-50 p-4 rounded-lg shadow-md space-y-4 mt-6 lg:mt-0">
                <h2 className="text-xl font-semibold text-gray-800">
                    Thông tin chủ sở hữu
                </h2>
                <p>
                    <strong>Chủ sở hữu:</strong> {roommateDetail.ownerName}
                </p>
                <p>
                    <strong>Số điện thoại:</strong>{' '}
                    {roommateDetail.contactNumber}
                </p>
                <p>
                    <strong>Email:</strong> {roommateDetail.contactEmail}
                </p>
            </div>

            {selectedImage && (
                <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="relative max-w-[80vw] max-h-[80vh]">
                        <Image
                            src={selectedImage}
                            alt="Selected"
                            width={100}
                            height={100}
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
            <Toaster position="top-right" />
        </div>
    );
}

export default RoommateDetailPage;
