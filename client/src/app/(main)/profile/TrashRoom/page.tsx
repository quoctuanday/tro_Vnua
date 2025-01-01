'use client';
import {
    forceDeleteRoom,
    getDeleteRoomPersonal,
    restoreRoomPersonal,
} from '@/api/api';
import { Room } from '@/schema/room';
import Currency from '@/utils/convertCurrency';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { RiFeedbackFill } from 'react-icons/ri';
import {
    FaCamera,
    FaSortAmountDown,
    FaSortAmountDownAlt,
    FaSpinner,
    FaTrashRestore,
} from 'react-icons/fa';
import { IoWarningOutline } from 'react-icons/io5';
import { MdDeleteForever } from 'react-icons/md';

function TrashRoomPage() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [roomSelected, setRoomSelected] = useState<Room | null>(null);
    const [reverseSort, setReverseSort] = useState(false);
    const [sortCriterion, setSortCriterion] = useState<
        'name' | 'date' | 'price'
    >('date');
    const [formVisible, setFormVisible] = useState(false);
    const [formFeedback, setFormFeedback] = useState(false);
    const [roomId, setRoomId] = useState('');

    useEffect(() => {
        const getData = async () => {
            const response = await getDeleteRoomPersonal();
            if (response) {
                console.log(response.data.rooms);
                setRooms(response.data.rooms);
            }
        };
        getData();
    }, []);

    //Sort rooms
    const getSortedRooms = () => {
        const sorted = [...rooms].sort((a, b) => {
            switch (sortCriterion) {
                case 'name':
                    return a.title.localeCompare(b.title);
                case 'date':
                    return (
                        new Date(b.createdAt ?? 0).getTime() -
                        new Date(a.createdAt ?? 0).getTime()
                    );
                case 'price':
                    return a.price - b.price;
                default:
                    return 0;
            }
        });

        if (reverseSort) {
            return sorted.reverse();
        }

        return sorted;
    };
    const sortedRooms = getSortedRooms();

    //Restore rooms
    const handelRestore = (roomId: string) => {
        const restore = async () => {
            const response = await restoreRoomPersonal(roomId);
            if (response) {
                toast.success('Khôi phục thành công!');
                setRooms(rooms.filter((room) => room._id !== roomId));
            } else {
                toast.error('Khôi phục thất bại!');
            }
        };
        restore();
    };

    //Delete rooms
    const handleForceDelete = (roomId: string) => {
        console.log(roomId);
        const forceDelete = async () => {
            const response = await forceDeleteRoom(roomId);
            if (response) {
                toast.success('Xóa thành công!');
                setRooms(rooms.filter((room) => room._id !== roomId));
                setFormVisible(false);
            } else {
                toast.error('Xóa thất bại!');
            }
        };
        forceDelete();
    };

    return (
        <div className="p-[1.3rem] roboto-regular">
            <div className="flex items-center text-[1.3rem]">
                <h1 className="roboto-bold">Thùng rác</h1>
            </div>
            <div className="mt-1 flex items-center justify-end">
                <select
                    name=""
                    id=""
                    onChange={(e) =>
                        setSortCriterion(
                            e.target.value as 'name' | 'date' | 'price'
                        )
                    }
                    className="rounded border-2 outline-none px-2 py-1"
                >
                    <option value="date">Sắp xếp theo ngày đăng</option>
                    <option value="price">Sắp xếp theo giá</option>
                    <option value="name">Sắp xếp theo tên</option>
                </select>
                {reverseSort ? (
                    <FaSortAmountDown
                        className="ml-2 hover:text-rootColor cursor-pointer"
                        onClick={() => {
                            setReverseSort(false);
                        }}
                    />
                ) : (
                    <FaSortAmountDownAlt
                        className="ml-2 hover:text-rootColor cursor-pointer"
                        onClick={() => {
                            setReverseSort(true);
                        }}
                    />
                )}
                <Link
                    href={'/profile/TrashRoom'}
                    className="block ml-2 hover:text-rootColor"
                ></Link>
            </div>
            <div className="">
                {sortedRooms ? (
                    sortedRooms.length > 0 ? (
                        <>
                            {sortedRooms.map((room, index) => (
                                <div
                                    className="mt-3 cursor-pointer"
                                    key={index}
                                >
                                    <div className="relative flex items-center">
                                        <Image
                                            src={`${room.images[0]}`}
                                            alt=""
                                            width={100}
                                            height={100}
                                            className="w-[6rem] h-[6rem] rounded-[10px]"
                                        ></Image>
                                        <div className="absolute px-1 py-1 bg-[#333] opacity-40 bottom-[5%] left-[0.6rem] text-white flex items-center justify-center rounded min-w-[1.5rem] h-[1.2rem]">
                                            <FaCamera />
                                            <p className="ml-2">
                                                {room.images.length}
                                            </p>
                                        </div>
                                        <div className="ml-2 flex flex-col justify-between max-w-[22.8rem] h-full">
                                            <div className="roboto-bold max-w-[22.8rem] max_line_1 ">
                                                {room.title}
                                            </div>
                                            <div className="max_line_2 ">
                                                {room.description}
                                            </div>
                                            <div className="flex items-center text-rootColor max-w-[22.8rem]">
                                                <div className="roboto-bold">
                                                    {Currency(
                                                        room.price,
                                                        'vi-VN'
                                                    )}
                                                    /tháng{' '}
                                                </div>
                                                <div className="ml-2 max_line_1 ">
                                                    {room.location.name}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="ml-auto flex items-center">
                                            <button
                                                onClick={() => {
                                                    setFormFeedback(true);
                                                    setRoomSelected(room);
                                                    console.log(room.feedBack);
                                                }}
                                                className="px-2 py-1 rounded bg-orange-500 hover:bg-orange-400 text-white"
                                            >
                                                <RiFeedbackFill />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handelRestore(room._id)
                                                }
                                                className="ml-2 px-2 py-1 rounded bg-rootColor hover:bg-[#699ba3c8] text-white"
                                            >
                                                <FaTrashRestore />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setFormVisible(true);
                                                    setRoomId(room._id);
                                                }}
                                                className="px-2 py-1 rounded ml-2 bg-red-500 hover:bg-[#ef4444cb] text-white"
                                            >
                                                <MdDeleteForever />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {formFeedback && (
                                <div className="fixed flex items-center justify-center top-0 bottom-0 left-0 right-0 z-[9999]">
                                    <div
                                        onClick={() => {
                                            setFormFeedback(false);
                                            setRoomId('');
                                        }}
                                        className="absolute top-0 bottom-0 left-0 right-0 opacity-50 bg-[#ccc]"
                                    ></div>
                                    <div className="relative px-10 flex flex-col justify-center items-center bg-white rounded-[10px] w-[30rem] min-h-[10rem]">
                                        <RiFeedbackFill className="text-[3rem] text-orange-500" />
                                        <p className="roboto-bold text-center mt-3">
                                            {roomSelected?.feedBack
                                                ? roomSelected.feedBack
                                                : 'không có phản hồi nào!'}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {formVisible && (
                                <div className="fixed flex items-center justify-center top-0 bottom-0 left-0 right-0 z-[9999]">
                                    <div
                                        onClick={() => {
                                            setFormVisible(false);
                                            setRoomId('');
                                        }}
                                        className="absolute top-0 bottom-0 left-0 right-0 opacity-50 bg-[#ccc]"
                                    ></div>
                                    <div className="relative px-10 flex flex-col justify-center items-center bg-white rounded-[10px] w-[40rem] h-[15rem]">
                                        <IoWarningOutline className="text-[3rem] text-red-500" />
                                        <p className="roboto-bold text-center mt-3">
                                            Bạn có chắc muốn xóa bài đăng này
                                            không? Hành động này không thể khôi
                                            phục, xin hãy cân nhắc.
                                        </p>
                                        <div className="flex items-center justify-center mt-3 text-white">
                                            <button
                                                onClick={() =>
                                                    handleForceDelete(roomId)
                                                }
                                                className="px-2 py-1 bg-red-400 hover:bg-red-300 rounded "
                                            >
                                                Xóa vĩnh viễn
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setFormVisible(false);
                                                    setRoomId('');
                                                }}
                                                className="px-2 py-1 bg-gray-400 hover:bg-gray-300 rounded ml-2"
                                            >
                                                Hủy bỏ
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex items-center justify-center mt-[3rem]">
                            <p>Thùng rác rỗng.</p>{' '}
                            <Link
                                href={'/profile/listRoom'}
                                className="ml-1 underline text-blue-500"
                            >
                                Quay lại tại đây!
                            </Link>
                        </div>
                    )
                ) : (
                    <>
                        <div className="flex items-center justify-center">
                            <FaSpinner className="spin" />
                        </div>
                    </>
                )}
            </div>
            <Toaster position="top-right" />
        </div>
    );
}

export default TrashRoomPage;
