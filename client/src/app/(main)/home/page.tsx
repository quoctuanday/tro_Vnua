'use client';
import React, { useEffect, useState } from 'react';
import { getAllRooms } from '@/api/api';
import { getAllNews } from '@/api/api';
import { Room } from '@/schema/room';
import { News } from '@/schema/news';
import Image from 'next/image';
import Link from 'next/link';
import AutoSlider from '@/components/autoSlider';

function HomePage() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [news, setNews] = useState<News[]>([]);

    useEffect(() => {
        const fetchRoomsAndNews = async () => {
            const roomResponse = await getAllRooms();
            const newsResponse = await getAllNews();

            if (
                roomResponse &&
                roomResponse.data &&
                roomResponse.data.formattedRooms
            ) {
                const data = roomResponse.data.formattedRooms;
                const availableRooms = data.filter(
                    (room: Room) => room.isAvailable && room.isCheckout
                );
                const latestRooms = availableRooms
                    .sort((a: Room, b: Room) => {
                        const dateA = a.createdAt
                            ? new Date(a.createdAt)
                            : new Date(0);
                        const dateB = b.createdAt
                            ? new Date(b.createdAt)
                            : new Date(0);
                        return dateB.getTime() - dateA.getTime();
                    })
                    .slice(0, 5);

                setRooms(latestRooms);
            }

            if (newsResponse && newsResponse.data) {
                setNews(newsResponse.data.news.slice(0, 5));
            }
        };

        fetchRoomsAndNews();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    return (
        <div className="p-[1.3rem] roboto-regular">
            <section className="mb-12 bg-gray-100 p-6 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-center text-primary mb-6">
                    Chào mừng đến với website của chúng tôi!
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                    Chúng tôi cung cấp một nền tảng tuyệt vời để bạn dễ dàng tìm
                    kiếm thông tin về các phòng trọ cho thuê, cũng như kết nối
                    với những người có nhu cầu ở ghép.
                </p>
                <p className="text-lg text-gray-700 mb-4">
                    Dù bạn đang tìm một phòng trọ cho riêng mình hay cần tìm
                    người chia sẻ không gian sống, chúng tôi đều có những lựa
                    chọn phù hợp với nhu cầu của bạn.
                </p>
                <p className="text-lg text-gray-700 mb-6">
                    Website của chúng tôi mang đến các phòng trọ chất lượng, với
                    đầy đủ thông tin chi tiết như giá cả, vị trí, tiện ích, và
                    đặc biệt là các phòng trọ mới nhất, giúp bạn tiết kiệm thời
                    gian và công sức trong việc tìm kiếm.
                </p>
                <div className="bg-primary text-white p-4 rounded-lg shadow-md mb-6">
                    <p className="font-semibold text-lg">
                        Chúng tôi cũng hỗ trợ tìm người ở ghép, giúp bạn dễ dàng
                        kết nối với những người có nhu cầu ở chung và chia sẻ
                        không gian sống thoải mái, tiết kiệm.
                    </p>
                </div>
                <p className="text-lg text-gray-700 mb-4">
                    Ngoài ra, chúng tôi còn cung cấp các tin tức cập nhật về các
                    phòng trọ, những thông tin hữu ích cho người thuê, từ các
                    mẹo tìm phòng trọ, đến các xu hướng trong việc tìm người ở
                    ghép.
                </p>
                <p className="text-lg text-gray-700">
                    Mọi thông tin bạn cần đều có sẵn tại đây, giúp bạn có được
                    sự lựa chọn tốt nhất. Hãy cùng khám phá những phòng trọ và
                    cơ hội tìm người ở ghép tại website của chúng tôi ngay hôm
                    nay!
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl roboto-bold mb-4">Phòng trọ mới nhất</h2>
                <AutoSlider<Room>
                    items={rooms}
                    itemWidth={280}
                    speed={10}
                    renderItem={(room) => (
                        <div className="border p-4 rounded-lg h-full">
                            <Image
                                src={
                                    room.images[0] ||
                                    '/path/to/default-image.jpg'
                                }
                                alt={room.title}
                                width={280}
                                height={180}
                                className="w-full h-[180px] rounded-lg"
                            />
                            <div className="flex flex-col justify-between h-[190px]">
                                <h3 className="text-lg roboto-bold mt-2 line-clamp-2">
                                    {room.title}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {room.location.name}
                                </p>
                                <p className="text-rootColor font-bold">
                                    {formatCurrency(room.price)} /tháng
                                </p>
                                <Link
                                    href={`/rooms/${room._id}`}
                                    className="text-blue-500 mt-2 inline-block"
                                >
                                    Xem chi tiết
                                </Link>
                            </div>
                        </div>
                    )}
                />
            </section>

            <section>
                <h2 className="text-xl roboto-bold mb-4">Tin tức mới nhất</h2>
                <AutoSlider<News>
                    items={news}
                    itemWidth={280}
                    speed={10}
                    renderItem={(news) => (
                        <div className="border p-4 rounded-lg h-full">
                            <Image
                                src={news.image || '/path/to/default-image.jpg'}
                                alt={news.title}
                                width={280}
                                height={180}
                                className="w-full h-[180px] rounded-lg"
                            />
                            <h3 className="text-lg roboto-bold mt-2">
                                <Link
                                    href={`/news/${news._id}`}
                                    className="text-blue-500"
                                >
                                    {news.title}
                                </Link>
                            </h3>
                            <p
                                className="text-sm text-gray-500"
                                dangerouslySetInnerHTML={{
                                    __html:
                                        news.content.substring(0, 100) + '...',
                                }}
                            />
                        </div>
                    )}
                />
            </section>
        </div>
    );
}

export default HomePage;
