'use client';
import { login } from '@/api/api';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

interface IFormInput {
    email: string;
    password: string;
}

function LoginPage() {
    const { register, handleSubmit } = useForm<IFormInput>();
    const [hiddenPass, setHiddenPass] = useState(true);
    const onSubmit = (data: unknown) => {
        const fetchData = async () => {
            try {
                const response = await login(data);
                if (response) {
                    console.log(response.data.token);
                }
            } catch (error) {
                console.log(error);
            }
        };
        fetchData();
    };
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
                        className=" w-[14rem] h-[8rem] absolute top-[-5%] left-[50%] transform translate-x-[-50%]"
                    ></Image>
                    <h1 className="pt-[4rem] roboto-bold text-center text-[1.2rem] ">
                        Đăng nhập
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
                    <div className="mt-2">
                        <label className="block">Mật khẩu</label>
                        <div className="relative">
                            <input
                                type={hiddenPass ? 'password' : 'text'}
                                {...register('password')}
                                placeholder="Nhập mật khẩu của bạn"
                                required
                                className="border-2 w-full px-2 py-1 rounded-[0.5rem] bg-[#efefef] outline-none "
                            />
                            <i
                                className="absolute cursor-pointer top-[50%] translate-y-[-50%] right-[5%]"
                                onClick={() => setHiddenPass(!hiddenPass)}
                            >
                                {hiddenPass ? <FaEyeSlash /> : <FaEye />}
                            </i>
                        </div>
                    </div>
                    <div className="mt-2">
                        <Link href={'#'}>Quên mật khẩu ?</Link>
                    </div>
                    <button className="mt-5 w-full py-1 text-center rounded-[0.5rem] bg-rootColor hover:bg-[#699ba3d9] text-white">
                        Đăng nhập
                    </button>
                    <div className="mt-2 pb-[1.3rem]">
                        <p className="inline text-[#ccc]">
                            Chưa có tài khoản?{' '}
                        </p>
                        <Link href={'/register'}>Đăng ký ngay!</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;
