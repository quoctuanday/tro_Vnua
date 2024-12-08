'use client';

import { useEffect, useState } from 'react';
import { getAllNews } from '@/api/api';
import { News } from '@/schema/news';
import dateConvert from '@/utils/convertDate';
import React from 'react';
import Image from 'next/image';

function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const [newsDetail, setNewsDetail] = useState<News | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { id } = React.use(params);

    useEffect(() => {
        if (!id) return;

        const getDetailData = async () => {
            try {
                setLoading(true);
                const response = await getAllNews();
                if (response && response.data) {
                    const newsItem = response.data.news.find(
                        (item: News) => item._id === id
                    );
                    if (newsItem) {
                        setNewsDetail(newsItem);
                    } else {
                        setError('Tin tức không tìm thấy.');
                    }
                }
            } catch (error) {
                console.log(error);
                setError('Lỗi khi tải tin tức.');
            } finally {
                setLoading(false);
            }
        };

        getDetailData();
    }, [id]);

    if (loading) {
        return <div>Đang tải...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (!newsDetail) {
        return <div>Không có dữ liệu để hiển thị.</div>;
    }

    // Loại bỏ tất cả các thẻ <img> từ content
    const sanitizedContent = newsDetail.content.replace(/<img[^>]*>/g, '');

    return (
        <div className="p-[1.3rem] roboto-regular">
            <h1 className="text-[1.5rem] roboto-bold mb-4">
                {newsDetail.title}
            </h1>
            <div className="text-sm text-rootColor mb-4">
                Ngày đăng: {dateConvert(newsDetail.createdAt)}
            </div>
            <div className="mb-4">
                <Image
                    src={newsDetail.image}
                    alt={newsDetail.title}
                    width={100}
                    height={100}
                    className="w-full h-auto rounded-[10px] mb-4"
                />
            </div>
            <div
                className="prose"
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
        </div>
    );
}

export default NewsDetailPage;
