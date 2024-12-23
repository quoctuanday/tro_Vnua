'use client';
import { getCount } from '@/api/api';
import { BarChart } from '@/components/barChartAdmin';
import Currency from '@/utils/convertCurrency';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AiOutlineRedo } from 'react-icons/ai';
import { FaSpinner } from 'react-icons/fa';
import { MdFilterListAlt } from 'react-icons/md';
interface Props {
    totalRevenue: number;
    userCount: number;
    roomCount: {
        availableRoomCount: number;
        unavailableRoomCount: number;
    };
    roommateCount: {
        availableRoommateCount: number;
        unavailableRoommateCount: number;
    };
    newsCount: number;
}

function Adminpage() {
    const { register, handleSubmit, reset } = useForm();
    const [data, setData] = useState<Props | null>(null);
    const [start, setStart] = useState<Date | null>(null);
    const [end, setEnd] = useState<Date | null>(null);
    const getData = async () => {
        const starts = new Date(new Date().getFullYear(), 0, 1);
        const ends = new Date();
        setStart(starts);
        setEnd(ends);
        const response = await getCount(starts, ends);
        if (response) {
            const data = response.data;
            setData(data.data);
        }
    };
    useEffect(() => {
        getData();
    }, []);

    const redo = async () => {
        getData();
    };

    const onSubmit = (data) => {
        const starts = new Date(data.start);
        const ends = new Date(data.end);
        console.log(starts, ends);
        const getData = async () => {
            setStart(starts);
            setEnd(ends);
            const response = await getCount(starts, ends);
            if (response) {
                const data = response.data;
                setData(data.data);
            }
        };
        getData();
        reset();
    };
    return (
        <div>
            <div className="h-[3rem] flex items-center justify-end px-2">
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex items-center "
                >
                    <label>Từ: </label>
                    <input
                        {...register('start', { required: true })}
                        type="date"
                        className=" ml-2 rounded bg-[#f4f3f8] border"
                    />
                    <label className="ml-2"> đến: </label>
                    <input
                        {...register('end', { required: true })}
                        type="date"
                        className=" ml-2 rounded bg-[#f4f3f8] border"
                    />
                    <button className=" ml-2 px-2 py-1 rounded-[10px] text-white bg-rootColor hover:bg-[#699ba3b8] flex items-center">
                        <MdFilterListAlt className="pr-1" />
                        Lọc
                    </button>
                    <button
                        onClick={() => {
                            redo();
                        }}
                        type="button"
                        className="text-white ml-2 bg-rootColor hover:bg-[#699ba3b8] p-1 rounded-full"
                    >
                        <AiOutlineRedo />
                    </button>
                </form>
            </div>
            <div className="bg-white h-[30rem]">
                {data ? (
                    <div className=" grid grid-cols-2 gap-3">
                        <div className="col-span-1">
                            <div className="">
                                <span>
                                    Tổng số người dùng: {data.userCount}
                                </span>
                                <span>Tổng số tin tức: {data.newsCount} </span>
                            </div>
                            <span>
                                Tổng doanh thu: {Currency(data.totalRevenue)}{' '}
                            </span>
                            <div className="">
                                {start && end && (
                                    <BarChart start={start} end={end} />
                                )}
                            </div>
                        </div>
                        <div className="col-span-1">
                            <div className="">
                                <span>
                                    Bài đăng thuê phòng:{' '}
                                    {data.roomCount.availableRoomCount +
                                        data.roomCount.unavailableRoomCount}
                                </span>
                                <div className="flex items-center">
                                    <span>
                                        Chưa duyệt:{' '}
                                        {data.roomCount.unavailableRoomCount}
                                    </span>
                                    <span>
                                        Đã duyệt:{' '}
                                        {data.roomCount.availableRoomCount}
                                    </span>
                                </div>
                            </div>
                            <div className="">
                                <span>
                                    Bài đăng tìm người ở ghép:{' '}
                                    {data.roommateCount.availableRoommateCount +
                                        data.roommateCount
                                            .unavailableRoommateCount}
                                </span>
                                <div className="flex items-center">
                                    <span>
                                        Chưa duyệt:{' '}
                                        {
                                            data.roommateCount
                                                .unavailableRoommateCount
                                        }
                                    </span>
                                    <span>
                                        Đã duyệt:{' '}
                                        {
                                            data.roommateCount
                                                .availableRoommateCount
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <FaSpinner className="spin" />
                    </div>
                )}
            </div>
        </div>
    );
}

export default Adminpage;
