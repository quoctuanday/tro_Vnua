'use client';
import { forceDeletedNews, getDeletedNews, restoreNews } from '@/api/api';
import { News } from '@/schema/news';
import dateConvert from '@/utils/convertDate';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
    FaSortAmountDown,
    FaSortAmountDownAlt,
    FaSpinner,
} from 'react-icons/fa';
import { IoWarningOutline } from 'react-icons/io5';

function TrashNewsPage() {
    const [news, setNews] = useState<News[]>([]);
    const [reverseSort, setReverseSort] = useState(false);
    const [sortCriterion, setSortCriterion] = useState<'name' | 'date'>('date');
    const [formVisible, setFormVisible] = useState(false);
    const [newsId, setNewsId] = useState('');
    useEffect(() => {
        let isMounted = true;
        const getData = async () => {
            const response = await getDeletedNews();
            if (isMounted && response) {
                console.log(response.data.news);
                setNews(response.data.news);
            }
        };
        getData();
        return () => {
            isMounted = false;
        };
    }, []);

    //sort news
    const getSortedNews = () => {
        const sorted = [...news].sort((a, b) => {
            switch (sortCriterion) {
                case 'name':
                    return a.title.localeCompare(b.title);
                case 'date':
                    return (
                        new Date(b.createdAt ?? 0).getTime() -
                        new Date(a.createdAt ?? 0).getTime()
                    );
                default:
                    return 0;
            }
        });

        if (reverseSort) {
            return sorted.reverse();
        }

        return sorted;
    };

    const sortedNews = getSortedNews();

    const handelRestore = (newsId: string) => {
        const restore = async () => {
            const response = await restoreNews(newsId);
            if (response) {
                toast.success('Khôi phục thành công!');
                setNews(news.filter((news) => news._id !== newsId));
            } else {
                toast.error('Khôi phục thất bại!');
            }
        };
        restore();
    };

    //Delete rooms
    const handleForceDelete = (newsId: string) => {
        console.log(newsId);
        const forceDelete = async () => {
            const response = await forceDeletedNews(newsId);
            if (response) {
                toast.success('Xóa thành công!');
                setNews(news.filter((news) => news._id !== newsId));
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
                        setSortCriterion(e.target.value as 'name' | 'date')
                    }
                    className="rounded border-2 outline-none px-2 py-1"
                >
                    <option value="date">Sắp xếp theo ngày đăng</option>
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
            </div>
            <div className="">
                {sortedNews ? (
                    sortedNews.length > 0 ? (
                        <>
                            {sortedNews.map((news) => (
                                <div className="mt-2" key={news._id}>
                                    <div className="flex items-center h-full">
                                        <Image
                                            src={`${news.image}`}
                                            alt=""
                                            width={100}
                                            height={100}
                                            className="w-[6rem] h-[6rem] rounded-[10px] border-2"
                                        ></Image>
                                        <div className="ml-2 flex flex-col flex-grow justify-between max-w-[26.8rem] h-full">
                                            <div className="roboto-bold max-w-[26.8rem] max_line_2 ">
                                                {news.title}
                                            </div>
                                            <div className="max_line_2 "></div>
                                            <div className="flex items-center text-rootColor">
                                                <div className="roboto-bold">
                                                    Ngày đăng:{' '}
                                                    {dateConvert(
                                                        news.createdAt
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="ml-auto flex items-center">
                                            <button
                                                onClick={() =>
                                                    handelRestore(news._id)
                                                }
                                                className="px-2 py-1 rounded bg-rootColor hover:bg-[#699ba3c8] text-white"
                                            >
                                                Khôi phục
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setFormVisible(true);
                                                    setNewsId(news._id);
                                                }}
                                                className="px-2 py-1 rounded ml-2 bg-red-500 hover:bg-[#ef4444cb] text-white"
                                            >
                                                Xóa vĩnh viễn
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {formVisible && (
                                <div className="fixed flex items-center justify-center top-0 bottom-0 left-0 right-0 z-[9999]">
                                    <div
                                        onClick={() => {
                                            setFormVisible(false);
                                            setNewsId('');
                                        }}
                                        className="absolute top-0 bottom-0 left-0 right-0 opacity-50 bg-[#ccc]"
                                    ></div>
                                    <div className="relative px-10 flex flex-col justify-center items-center bg-white rounded-[10px] w-[40rem] h-[15rem]">
                                        <IoWarningOutline className="text-[3rem] text-red-500" />
                                        <p className="roboto-bold text-center mt-3">
                                            Bạn có chắc muốn xóa tin tức này
                                            không? Hành động này không thể khôi
                                            phục, xin hãy cân nhắc.
                                        </p>
                                        <div className="flex items-center justify-center mt-3 text-white">
                                            <button
                                                onClick={() =>
                                                    handleForceDelete(newsId)
                                                }
                                                className="px-2 py-1 bg-red-400 hover:bg-red-300 rounded "
                                            >
                                                Xóa vĩnh viễn
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setFormVisible(false);
                                                    setNewsId('');
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
                                href={'/profile/postNews'}
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

export default TrashNewsPage;
