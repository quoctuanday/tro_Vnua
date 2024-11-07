'use client';
import { updateProfile } from '@/api/api';
import { User } from '@/schema/user';
import { useUser } from '@/store/userData';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';
function EditPage() {
    const router = useRouter();
    const { userLoginData, setUserLoginData } = useUser();
    const { register, handleSubmit, reset } = useForm();
    useEffect(() => {
        const getData = () => {
            if (userLoginData) {
                reset(userLoginData);
            }
        };
        getData();
    }, [userLoginData, reset]);

    const onSubmit = (data: unknown) => {
        if (!data) return;
        const updateData = async () => {
            try {
                const response = await updateProfile(data);
                if (response) {
                    setUserLoginData(data as User);
                    toast.success('Cập nhật thông tin thành công!');
                    setTimeout(() => {
                        router.push('/profile');
                    }, 2000);
                }
            } catch (error) {
                console.log(error);
                toast.error('Cập nhật thông tin không thành công!');
            }
        };
        updateData();
    };
    return (
        <div>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="p-[1.3rem] roboto-regular "
            >
                <div className="roboto-bold text-[1.3rem] flex items-center">
                    <h1>Chỉnh sửa thông tin</h1>
                </div>

                <div className="mt-3">
                    <div>Tên người dùng: </div>
                    <input
                        className="rounded-[0.6rem] bg-[#ebe8e8] min-w-[18rem] px-2 py-1 shadow-custom-light outline-none"
                        {...register('userName')}
                        type="text"
                    />
                </div>
                <div className="mt-3">
                    <div>Giới tính: </div>
                    <div className="flex items-center">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                value="Nam"
                                {...register('gender')}
                                className="mr-2"
                            />
                            Nam
                        </label>
                        <label className="flex items-center ml-3">
                            <input
                                type="radio"
                                value="Nữ"
                                {...register('gender')}
                                className="mr-2"
                            />
                            Nữ
                        </label>
                    </div>
                </div>
                <div className="mt-3">
                    <div>Ngày sinh: </div>
                    <input
                        className="rounded-[0.6rem] bg-[#ebe8e8] min-w-[18rem] px-2 py-1 shadow-custom-light outline-none"
                        {...register('DOB')}
                        type="date"
                    />
                </div>
                <div className="mt-3">
                    <div>Email: </div>
                    <input
                        className="rounded-[0.6rem] bg-[#ebe8e8] min-w-[18rem] px-2 py-1 shadow-custom-light outline-none"
                        {...register('email')}
                        type="text"
                    />
                </div>
                <div className="mt-3">
                    <div>Số điện thoại: </div>
                    <input
                        className="rounded-[0.6rem] bg-[#ebe8e8] min-w-[18rem] px-2 py-1 shadow-custom-light outline-none"
                        {...register('phoneNumber')}
                        type="text"
                    />
                </div>

                <button
                    type="submit"
                    className="mt-3 rounded-[0.6rem] px-2 py-1 bg-rootColor hover:bg-[#699ba3c9] text-white "
                >
                    Cập nhật
                </button>
            </form>
            <Toaster position="top-right" />
        </div>
    );
}

export default EditPage;
