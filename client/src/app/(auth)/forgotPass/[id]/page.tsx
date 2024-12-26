'use client';
import { resetPassword } from '@/api/api';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { TfiReload } from 'react-icons/tfi';

interface IFormInput {
    password: string;
    passwordConfirm: string;
}

function ResetPassPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<IFormInput>();
    const [hiddenPass, setHiddenPass] = useState(true);
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

    const onSubmit = async (data: unknown) => {
        const resolvedParams = await params;
        const { id } = resolvedParams;

        if (inputRef.current?.value !== captcha) {
            setError('Captcha không hợp lệ. Mời nhập lại!');
            return;
        }
        const fetchData = async () => {
            try {
                const response = await resetPassword(id, data);
                if (response) {
                    toast.success('Thay đổi mật khẩu thành công!');
                    setTimeout(() => {
                        router.push('/login');
                    }, 2000);
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
                    <h1 className="pt-[4.3rem] roboto-bold text-center text-[1.2rem] ">
                        Thay đổi mật khẩu
                    </h1>
                    <div className="mt-2">
                        <label className="block">Mật khẩu mới </label>
                        <div className="relative">
                            <input
                                type={hiddenPass ? 'password' : 'text'}
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
                            <button
                                type="button"
                                className="absolute cursor-pointer top-[50%] translate-y-[-50%] right-[5%]"
                                onClick={() => setHiddenPass(!hiddenPass)}
                            >
                                {hiddenPass ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>
                    <div className="mt-2">
                        <label className="block">Nhập lại mật khẩu</label>
                        <div className="relative">
                            <input
                                type={hiddenPass ? 'password' : 'text'}
                                {...register('passwordConfirm', {
                                    validate: (value) =>
                                        value === password ||
                                        'Mật khẩu không trùng khớp.',
                                })}
                                placeholder="Nhập lại mật khẩu của bạn"
                                className="border-2 w-full px-2 py-1 rounded-[0.5rem] bg-[#efefef] outline-none "
                            />
                            <button
                                type="button"
                                className="absolute cursor-pointer top-[50%] translate-y-[-50%] right-[5%]"
                                onClick={() => setHiddenPass(!hiddenPass)}
                            >
                                {hiddenPass ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
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

                    <button className="mt-5 mb-5 w-full py-1 text-center rounded-[0.5rem] bg-rootColor hover:bg-[#699ba3d9] text-white">
                        Xác nhận
                    </button>
                </form>
            </div>
            <Toaster position="top-right" />
        </div>
    );
}

export default ResetPassPage;
