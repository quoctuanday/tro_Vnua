'use client';
import { forgotPassword } from '@/api/api';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';
import { BsPatchCheckFill } from 'react-icons/bs';

interface IFormInput {
    email: string;
}

function ForgotPassPage() {
    const [isClient, setIsClient] = useState(false);
    const { register, handleSubmit } = useForm<IFormInput>();
    const [messageForm, setMessageForm] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const onSubmit = (data: unknown) => {
        const fetchData = async () => {
            try {
                const response = await forgotPassword(data);
                if (response) {
                    toast.success('Xác nhận thành công!');
                    setMessageForm(true);
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                if (error.response && error.response.status === 404) {
                    toast.error('Tài khoản bạn đã nhập không tồn tại!');
                } else {
                    toast.error('Xác nhận thất bại');
                    console.log(error.response);
                }
            }
        };
        fetchData();
    };
    if (!isClient) {
        return null;
    }
    return (
        <div className="flex items-center justify-center h-[100vh] bg-[#efefef]">
            <div className="relative ">
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="w-[28rem] px-[1.3rem] rounded-[0.6rem] shadow-custom-light roboto-bold bg-white "
                >
                    <Image
                        src={'/images/logo.png'}
                        alt=""
                        width={1000}
                        height={1000}
                        priority
                        className=" w-[14rem] h-[5rem] absolute top-0 left-[50%] transform translate-x-[-50%]"
                    ></Image>
                    <h1 className="pt-[4rem] roboto-bold text-center text-[1.2rem] ">
                        Quên mật khẩu
                    </h1>
                    <div className="mt-2">
                        <label className="block">Tài khoản</label>
                        <input
                            type="email"
                            {...register('email')}
                            placeholder="example@gmail.com"
                            required
                            className="border-2 w-full px-2 py-1 rounded-[0.5rem] bg-[#efefef] outline-none "
                        />
                    </div>

                    <button className="mt-5 mb-5 w-full py-1 text-center rounded-[0.5rem] bg-rootColor hover:bg-[#699ba3d9] text-white">
                        Xác nhận
                    </button>
                </form>
            </div>
            <Toaster position="top-right" />
            {messageForm && (
                <div className="fixed w-full h-full flex items-center justify-center">
                    <div
                        onClick={() => setMessageForm(false)}
                        className="absolute top-0 left-0 right-0 bottom-0 opacity-50 bg-[#fefefe]"
                    ></div>
                    <div className="relative w-[30rem] h-[10rem] bg-white rounded flex items-center justify-center">
                        <div className="text-[2rem] text-green-400">
                            <BsPatchCheckFill />
                        </div>
                        <span className="ml-2 roboto-bold">
                            Link xác nhận đã được gửi về email của bạn.
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ForgotPassPage;
