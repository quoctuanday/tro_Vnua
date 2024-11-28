'use client';
import { deleteNews, getNewsPersonal } from '@/api/api';
import PostNews from '@/components/PostNew';
import { News } from '@/schema/news';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { FaSortAmountDown, FaSortAmountDownAlt, FaTrash } from 'react-icons/fa';
import { FaPencil } from 'react-icons/fa6';
import { MdAddBox } from 'react-icons/md';
import dateConvert from '@/utils/convertDate';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import { useUser } from '@/store/userData';

function PostNewsPage() {
    const { socket } = useUser();
    const [formVisible, setFormVisible] = useState(false);
    const [news, setNews] = useState<News[]>([]);
    const [currentNewsIndex, setCurrentNewsIndex] = useState<number | null>(0);
    const [action, setAction] = useState(true);
    const [reverseSort, setReverseSort] = useState(false);
    const [sortCriterion, setSortCriterion] = useState<'name' | 'date'>('date');

    useEffect(() => {
        let isMounted = true;
        const getData = async () => {
            const response = await getNewsPersonal();
            if (isMounted && response) {
                console.log(response.data.news);
                setNews(response.data.news);
            }
        };
        getData();
        if (!socket) return;
        socket.on('news-update', () => {
            getData();
        });
        return () => {
            isMounted = false;
        };
    }, [socket]);

    const handleDelete = async (newsId: string) => {
        const response = await deleteNews(newsId);
        if (response) {
            toast.success('Xóa tin thành công!');
            setNews(news.filter((news) => news._id !== newsId));
        } else {
            toast.error('Xóa tin thất bại!');
        }
    };

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

    return (
        <div>
            <div className="p-[1.3rem] roboto-regular">
                <div className="flex items-center text-[1.3rem]">
                    <h1 className="roboto-bold">Đăng tin tức</h1>
                    <div
                        onClick={() => {
                            setFormVisible(true);
                            setAction(true);
                        }}
                    >
                        <MdAddBox className="ml-2 hover:text-rootColor cursor-pointer" />
                    </div>
                </div>

                {action
                    ? formVisible &&
                      currentNewsIndex !== null && (
                          <PostNews
                              setFormVisible={setFormVisible}
                              action={true}
                              news={news}
                              newsIndex={0}
                          />
                      )
                    : formVisible &&
                      currentNewsIndex !== null && (
                          <PostNews
                              setFormVisible={setFormVisible}
                              action={false}
                              news={sortedNews}
                              newsIndex={currentNewsIndex}
                          />
                      )}
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
                    <Link
                        href={'/profile/TrashNews'}
                        className="block ml-2 hover:text-rootColor"
                    >
                        <FaTrash />
                    </Link>
                </div>

                <div className="mt-3">
                    {sortedNews.map((news, index) => (
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
                                            {dateConvert(news.createdAt)}
                                        </div>
                                    </div>
                                </div>
                                <div className="ml-auto">
                                    <button
                                        onClick={() => {
                                            setCurrentNewsIndex(index);
                                            setFormVisible(true);
                                            setAction(false);
                                        }}
                                        className="px-2 py-1 rounded bg-rootColor hover:bg-[#699ba3c8] text-white"
                                    >
                                        <FaPencil />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(news._id)}
                                        className="px-2 py-1 rounded ml-2 bg-red-500 hover:bg-[#ef4444cb] text-white"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <Toaster position="top-right" />
        </div>
    );
}

export default PostNewsPage;
