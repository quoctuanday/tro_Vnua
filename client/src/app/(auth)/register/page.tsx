'use client';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { createUser } from '@/api/api';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { TfiReload } from 'react-icons/tfi';

interface IFormInput {
    userName: string;
    email: string;
    phoneNumber: string;
    password: string;
    passwordConfirm: string;
}

function RegisterPage() {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<IFormInput>();
    const [isRoting, setIsRoting] = useState(false);
    const [captcha, setCaptcha] = useState('');
    const [error, setError] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const password = watch('password');
    const drawCaptcha = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const captchaText = Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase();
        setCaptcha(captchaText);
        console.log('Captcha:', captchaText);

        ctx.font = '30px Arial';
        ctx.fillStyle = '#000';
        ctx.fillText(captchaText, 50, 35);

        for (let i = 0; i < 10; i++) {
            ctx.beginPath();
            ctx.moveTo(
                Math.random() * canvas.width,
                Math.random() * canvas.height
            );
            ctx.lineTo(
                Math.random() * canvas.width,
                Math.random() * canvas.height
            );
            ctx.strokeStyle = '#ccc';
            ctx.stroke();
        }
    };

    useEffect(() => {
        drawCaptcha();
    }, []);

    const onSubmit = (data: unknown) => {
        if (inputRef.current?.value !== captcha) {
            setError('Captcha không hợp lệ. Mời nhập lại!');
            return;
        }
        const fetchData = async () => {
            try {
                const response = await createUser(data);
                switch (response.status) {
                    case 201:
                        toast.success('Tạo tài khoản thành công!');
                        setTimeout(() => {
                            router.push('/login');
                        }, 2000);
                        break;
                    case 409:
                        toast.error('Tài khoản đã tồn tại!');
                        break;
                }
            } catch (error) {
                console.log(error);
            }
        };
        fetchData();
    };

    const regex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

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
                        Đăng ký
                    </h1>
                    <div className="mt-2">
                        <label className="block">Tài khoản</label>
                        <input
                            {...register('email')}
                            type="email"
                            placeholder="example@gmail.com"
                            className="border-2 w-full px-2 py-1 rounded-[0.5rem] bg-[#efefef] outline-none "
                        />
                    </div>
                    <div className="mt-2">
                        <label className="block">Số điện thoại</label>
                        <input
                            {...register('phoneNumber')}
                            type="text"
                            placeholder="090********"
                            className="border-2 w-full px-2 py-1 rounded-[0.5rem] bg-[#efefef] outline-none "
                        />
                    </div>
                    <div className="mt-2">
                        <label className="block">Tên người dùng</label>
                        <input
                            {...register('userName', { required: true })}
                            type="text"
                            placeholder="Nguyen Van A"
                            className="border-2 w-full px-2 py-1 rounded-[0.5rem] bg-[#efefef] outline-none "
                        />
                    </div>
                    <div className="mt-2">
                        <label className="block">Mật khẩu</label>
                        <input
                            type="password"
                            {...register('password', {
                                required: true,
                                minLength: {
                                    value: 8,
                                    message: 'Mật khẩu từ 8 kí tự trở lên.',
                                },
                                pattern: {
                                    value: regex,
                                    message:
                                        'Mật khẩu cần ít nhất 1 kí tự in hoa, 1 kí tự in thường, 1 số và 1 kí tự đặc biệt.',
                                },
                            })}
                            placeholder="Nhập mật khẩu của bạn"
                            className="border-2 w-full px-2 py-1 rounded-[0.5rem] bg-[#efefef] outline-none "
                        />
                    </div>
                    <div className="mt-2">
                        <label className="block">Nhập lại mật khẩu</label>
                        <input
                            type="password"
                            {...register('passwordConfirm', {
                                validate: (value) =>
                                    value === password ||
                                    'Mật khẩu không trùng khớp.',
                            })}
                            placeholder="Nhập lại mật khẩu của bạn"
                            className="border-2 w-full px-2 py-1 rounded-[0.5rem] bg-[#efefef] outline-none "
                        />
                    </div>
                    <div className="mt-3">
                        <div className="border-2 border-dotted w-full h-[5rem]">
                            <canvas
                                ref={canvasRef}
                                className="w-full h-full"
                                width="200"
                                height="50"
                            ></canvas>
                        </div>
                        <div className="flex w-full">
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Xin hãy nhập captcha"
                                className="px-2 py-1 border-black border w-full text-center"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setIsRoting(true);
                                    drawCaptcha();
                                    setTimeout(() => {
                                        setIsRoting(false);
                                    }, 1000);
                                }}
                                className="px-2 py-1 text-white bg-blue-500 h-"
                            >
                                <TfiReload
                                    className={`${isRoting ? 'spin' : ''}`}
                                />
                            </button>
                        </div>
                    </div>
                    {error && <p className="text-red-500">{error}</p>}

                    <p className="text-red-500">{errors.password?.message}</p>
                    <p className="text-red-500">
                        {errors.passwordConfirm?.message}
                    </p>
                    <button className="mt-5 w-full py-1 text-center rounded-[0.5rem] bg-rootColor hover:bg-[#699ba3d9] text-white">
                        Đăng ký
                    </button>
                    <div className="mt-2 pb-[1.3rem]">
                        <p className="inline text-[#ccc]">Đã có tài khoản? </p>
                        <Link href={'/login'}>Đăng nhập ngay!</Link>
                    </div>
                </form>
            </div>
            <Toaster position="top-right" />
        </div>
    );
}

export default RegisterPage;
