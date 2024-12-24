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
        const fetchFilteredData = async () => {
            setStart(starts);
            setEnd(ends);
            const response = await getCount(starts, ends);
            if (response) {
                const data = response.data;
                setData(data.data);
            }
        };
        fetchFilteredData();
        reset();
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="flex items-center justify-between bg-white shadow-md p-4 rounded-md">
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex items-center gap-4"
                >
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Từ:
                        </label>
                        <input
                            {...register('start', { required: true })}
                            type="date"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Đến:
                        </label>
                        <input
                            {...register('end', { required: true })}
                            type="date"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                    <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <MdFilterListAlt className="mr-2" /> Lọc
                    </button>
                    <button
                        onClick={redo}
                        type="button"
                        className="inline-flex items-center p-2 text-sm font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <AiOutlineRedo />
                    </button>
                </form>
            </div>

            <div className="mt-6 bg-white shadow-md rounded-md p-6">
                {data ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-md shadow">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Thống kê chung
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Tổng số người dùng: {data.userCount}
                                </p>
                                <p className="text-sm text-gray-600">
                                    Tổng số tin tức: {data.newsCount}
                                </p>
                                <p className="text-sm text-gray-600">
                                    Tổng doanh thu:{' '}
                                    {Currency(data.totalRevenue)}
                                </p>
                            </div>
                            {start && end && (
                                <div className="bg-gray-50 p-4 rounded-md shadow">
                                    <BarChart start={start} end={end} />
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-md shadow">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Bài đăng thuê phòng
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Tổng số bài đăng:{' '}
                                    {data.roomCount.availableRoomCount +
                                        data.roomCount.unavailableRoomCount}
                                </p>
                                <p className="text-sm text-gray-600">
                                    Đã duyệt:{' '}
                                    {data.roomCount.availableRoomCount}
                                </p>
                                <p className="text-sm text-gray-600">
                                    Chưa duyệt:{' '}
                                    {data.roomCount.unavailableRoomCount}
                                </p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-md shadow">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Bài đăng tìm người ở ghép
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Tổng số bài đăng:{' '}
                                    {data.roommateCount.availableRoommateCount +
                                        data.roommateCount
                                            .unavailableRoommateCount}
                                </p>
                                <p className="text-sm text-gray-600">
                                    Đã duyệt:{' '}
                                    {data.roommateCount.availableRoommateCount}
                                </p>
                                <p className="text-sm text-gray-600">
                                    Chưa duyệt:{' '}
                                    {
                                        data.roommateCount
                                            .unavailableRoommateCount
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <FaSpinner
                            className="animate-spin text-indigo-600"
                            size={24}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default Adminpage;
