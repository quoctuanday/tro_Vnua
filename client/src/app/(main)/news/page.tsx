'use client';
import { getAllNews } from '@/api/api';
import Pagination from '@/components/pagination';
import { News } from '@/schema/news';
import { useUser } from '@/store/userData';
import dateConvert from '@/utils/convertDate';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { FaSpinner } from 'react-icons/fa';

function NewsPage() {
    const { socket } = useUser();
    const [news, setNews] = useState<News[]>([]);
    const [filterNews, setFilterNews] = useState<News[]>([]);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const getNews = async () => {
            const response = await getAllNews();
            if (response) {
                const data = response.data.news;
                setNews(data);
                setFilterNews(data);
            }
        };
        getNews();
        if (socket) {
            socket.on('news-update', () => {
                getNews();
            });
        }
    }, [socket]);
    const newsPerPage = 9;
    const totalNews = filterNews.length;
    const totalPages = Math.ceil(totalNews / newsPerPage);
    const startIndex = (currentPage - 1) * newsPerPage;
    const endIndex = startIndex + newsPerPage;
    const currentNews = filterNews.slice(startIndex, endIndex);
    return (
        <div>
            <h1 className="roboto-bold text-[1.3rem] pt-3">Tin tức</h1>
            <div className="grid grid-cols-3 mt-3 gap-x-6 gap-y-12">
                {currentNews ? (
                    currentNews.map((news) => (
                        <Link
                            href={`/news/${news._id}`}
                            className="grid shadow-custom-light grid-rows-2 col-span-1 h-[22rem] w-full  rounded"
                            key={news._id}
                        >
                            <div className="row-span-1 rounded-t  overflow-hidden">
                                <Image
                                    src={news.image}
                                    alt="ảnh tin tức"
                                    width={200}
                                    height={200}
                                    loading="lazy"
                                    className="w-full h-full"
                                ></Image>
                            </div>
                            <div className="row-span-1 rounded-b bg-white ml-3 ">
                                <p className=" mt-3 roboto-thin">Tin tức</p>
                                <h2 className=" roboto-bold text-[1.3rem] line-clamp-2 ">
                                    {news.title}
                                </h2>
                                <p>Ngày đăng: {dateConvert(news.createdAt)}</p>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="flex items-center justify-center text-black spin">
                        <FaSpinner />
                    </div>
                )}
            </div>
            <Pagination
                currentPage={currentPage}
                totalPage={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}

export default NewsPage;
