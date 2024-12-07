'use client';
import { getNewsPersonal } from '@/api/api'; 
import { News } from '@/schema/news'; 
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { FaSortAmountDown, FaSortAmountDownAlt } from 'react-icons/fa';
import dateConvert from '@/utils/convertDate'; 
import Link from 'next/link'; 

function NewsPage() {
    const [news, setNews] = useState<News[]>([]);
    const [sortCriterion, setSortCriterion] = useState<'name' | 'date'>('date');
    const [reverseSort, setReverseSort] = useState(false);

    useEffect(() => {
        const getData = async () => {
            const response = await getNewsPersonal();
            if (response && response.data) {
                setNews(response.data.news);
            }
        };
        getData();
    }, []);

    // Sắp xếp tin tức
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
        <div className="p-[1.3rem] roboto-regular">
            <h1 className="text-[1.5rem] roboto-bold mb-4">Tin tức</h1>

            <div className="mt-1 flex items-center justify-end">
                <select
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
                        onClick={() => setReverseSort(false)}
                    />
                ) : (
                    <FaSortAmountDownAlt
                        className="ml-2 hover:text-rootColor cursor-pointer"
                        onClick={() => setReverseSort(true)}
                    />
                )}
            </div>

            <div className="mt-3">
                {sortedNews.map((newsItem) => (
                    <div className="mt-4" key={newsItem._id}>
                        <div className="flex items-center">
                            <Image
                                src={newsItem.image}
                                alt={newsItem.title}
                                width={100}
                                height={100}
                                className="w-[6rem] h-[6rem] rounded-[10px] border-2"
                            />
                            <div className="ml-4 flex flex-col flex-grow">
                                <h2 className="text-xl roboto-bold">
                                    <Link href={`/news/${newsItem._id}`} passHref>
                                        {newsItem.title}
                                    </Link>
                                </h2>
                                <p className="text-sm text-gray-500"
                                   dangerouslySetInnerHTML={{
                                        __html: newsItem.content.substring(0, 100) + '...'
                                    }} />
                                <div className="text-sm text-rootColor">
                                    Ngày đăng: {dateConvert(newsItem.createdAt)}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default NewsPage;
