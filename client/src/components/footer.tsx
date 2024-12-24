import Link from 'next/link';
import React from 'react';
import { FaDiscord, FaFacebook, FaInstagram } from 'react-icons/fa';
import { SiZalo } from 'react-icons/si';
import emailjs from 'emailjs-com';

function FooterPage() {
    const sendEmail = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        emailjs
            .sendForm(
                'service_fsj8nyz', // serviceId
                'template_sf911om', // templateId
                e.currentTarget,
                'VnoibbmzVDBnpcdDL' // userId
            )
            .then(
                (result) => {
                    console.log('Email sent successfully:', result.text);
                    alert('Gửi liên hệ thành công!');
                },
                (error) => {
                    console.error('Error sending email:', error.text);
                    alert('Gửi liên hệ thất bại. Vui lòng thử lại sau.');
                }
            );

        e.currentTarget.reset();
    };
    return (
        <footer className="bg-rootColor text-white py-10">
            <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                    <h3 className="text-xl font-semibold mb-6">
                        Kết nối với chúng tôi
                    </h3>
                    <div className="flex justify-center space-x-8">
                        <Link
                            href="https://facebook.com"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <FaFacebook className="text-white text-3xl hover:text-blue-500 transition" />
                        </Link>
                        <Link
                            href="https://zalo.me"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <SiZalo className="text-white text-3xl hover:text-blue-500 transition" />
                        </Link>
                        <Link
                            href="https://instagram.com"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <FaInstagram className="text-white text-3xl hover:text-pink-400 transition" />
                        </Link>
                        <Link
                            href="https://discord.com"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <FaDiscord className="text-white text-3xl hover:text-indigo-400 transition" />
                        </Link>
                    </div>
                </div>

                <div className="text-center">
                    <h3 className="text-xl font-semibold mb-6">Điều hướng</h3>
                    <ul className="space-y-3 text-base">
                        <li>
                            <Link
                                href="/home"
                                className="hover:text-blue-400 transition-colors"
                            >
                                Trang chủ
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/rooms"
                                className="hover:text-blue-400 transition-colors"
                            >
                                Cho thuê phòng
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/roommates"
                                className="hover:text-blue-400 transition-colors"
                            >
                                Tìm người ở ghép
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/news"
                                className="hover:text-blue-400 transition-colors"
                            >
                                Tin tức
                            </Link>
                        </li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-xl font-semibold mb-6 text-center">
                        Liên hệ
                    </h3>
                    <form className="space-y-4 text-base" onSubmit={sendEmail}>
                        <div>
                            <input
                                type="text"
                                name="name"
                                placeholder="Tên của bạn"
                                className="w-full px-4 py-3 rounded-lg text-black focus:outline-none focus:ring focus:ring-blue-300 shadow"
                                required
                            />
                        </div>
                        <div>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email của bạn"
                                className="w-full px-4 py-3 rounded-lg text-black focus:outline-none focus:ring focus:ring-blue-300 shadow"
                                required
                            />
                        </div>
                        <div>
                            <input
                                type="tel"
                                name="phone"
                                placeholder="Số điện thoại"
                                className="w-full px-4 py-3 rounded-lg text-black focus:outline-none focus:ring focus:ring-blue-300 shadow"
                                required
                            />
                        </div>
                        <div>
                            <textarea
                                name="message"
                                placeholder="Nhập tin nhắn..."
                                rows={3}
                                className="w-full px-4 py-3 rounded-lg text-black focus:outline-none focus:ring focus:ring-blue-300 shadow"
                                required
                            ></textarea>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-all shadow hover:shadow-lg"
                        >
                            Gửi liên hệ
                        </button>
                    </form>
                </div>
            </div>

            <div className="mt-10 text-center text-sm border-t border-gray-600 pt-6">
                <p>&copy; 2024 - Trang web tìm trọ và tìm người ở ghép.</p>
            </div>
        </footer>
    );
}

export default FooterPage;
