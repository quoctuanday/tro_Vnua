'use client';
import CustomerMap from '@/components/Map';
import LocationInput from '@/components/locationInput';
import Image from 'next/image';
import React, { useRef, useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { IoClose, IoCloseCircleOutline } from 'react-icons/io5';
import getCoordinates from '../utils/locationIntoCoordinates';
import { useForm } from 'react-hook-form';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import toast, { Toaster } from 'react-hot-toast';
import { useUser } from '@/store/userData';
import { v4 as uuidv4 } from 'uuid';
import { storage } from '@/firebase/config';
import { createRoom } from '@/api/api';

//type
interface PostRoomProps {
    setFormVisible: React.Dispatch<React.SetStateAction<boolean>>;
}
type Coordinates = {
    latitude: number;
    longitude: number;
} | null;

const PostRoom: React.FC<PostRoomProps> = ({ setFormVisible }) => {
    const { userLoginData } = useUser();
    const { register, handleSubmit, getValues } = useForm();
    // const [typeRoom, setTypeRoom] = useState<number | null>(null);
    const [files, setFiles] = useState<File[]>([]);
    const [changeImage, setChangeImage] = useState<string[]>([]);
    const uploadImage = useRef<HTMLInputElement>(null);
    const [coords, setCoords] = useState<Coordinates>(null);
    const [error, setError] = useState();

    // const handleClickType = (index: number) => {
    //     setTypeRoom(typeRoom === index ? null : index);
    // };

    //Set image
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        const maxSizeInMB = 2;
        const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

        if (selectedFiles) {
            const validFiles = Array.from(selectedFiles).filter((file) => {
                if (file.size > maxSizeInBytes) {
                    console.warn(
                        `${file.name} vượt quá giới hạn kích thước ${maxSizeInMB} MB`
                    );
                    return false;
                }
                return true;
            });
            const imageUrls = validFiles.map((file) =>
                URL.createObjectURL(file)
            );
            setChangeImage((prevFiles) => [...prevFiles, ...imageUrls]);
            setFiles((prevFiles) => [...prevFiles, ...validFiles]);
            console.log(files);
        }
    };

    const handleRemoveImage = (index: number) => {
        setChangeImage((prevImages) =>
            prevImages.filter((_, i) => i !== index)
        );

        setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    //set map
    const searchMap = async () => {
        const locationValue = getValues('location');
        if (locationValue) {
            getCoordinates(locationValue)
                .then((coords: { latitude: number; longitude: number }) =>
                    setCoords(coords)
                )
                .catch((error) => setError(error.message));
        }
    };

    //submit form
    const onSubmit = async (data: unknown) => {
        if (!files) {
            toast.error('Chưa chọn ảnh!');
            return;
        }
        const randomFolderName = uuidv4();
        const folderPath = `troVnua/${userLoginData?.userName}/room/${randomFolderName}`;
        try {
            const uploadImages = await Promise.all(
                files.map(async (file) => {
                    const storageRef = ref(
                        storage,
                        `${folderPath}/${file.name}`
                    );

                    try {
                        await uploadBytes(storageRef, file);
                        const url = await getDownloadURL(storageRef);
                        return url;
                    } catch (error) {
                        console.log('Lỗi upload ảnh:', error);
                        return null;
                    }
                })
            );

            const successfulUploads = uploadImages.filter(
                (result) => result !== null
            );
            console.log(successfulUploads);
            const userId = userLoginData?._id;

            console.log(data);
            const response = await createRoom({
                data,
                userId,
                folderPath,
                successfulUploads,
                coords,
            });
            if (response) {
                toast.success('Đăng tìm phòng thành công!');
                setFormVisible(false);
            }
        } catch (error) {
            console.error('Có lỗi xảy ra trong quá trình upload:', error);
        }
    };

    return (
        <div className="fixed flex items-center justify-center top-0 bottom-0 left-0 right-0 z-[9999]">
            <div
                className="absolute top-0 bottom-0 left-0 right-0  opacity-50 bg-[#ccc]"
                onClick={() => setFormVisible(false)}
            ></div>
            <div
                className="relative w-[52rem] max-h-[40rem] overflow-y-auto overflow-hidden min-h-[16rem] bg-white rounded-[10px] shadow-custom-light p-[1rem]
            [&::-webkit-scrollbar]:w-2
            [&::-webkit-scrollbar-track]:rounded-[10px]
             [&::-webkit-scrollbar-track]:bg-gray-100
            [&::-webkit-scrollbar-thumb]:rounded-[10px]
             [&::-webkit-scrollbar-thumb]:bg-gray-300"
            >
                <div className="">
                    <div className=" flex items-center justify-end text-[1.3rem] ">
                        <IoClose
                            className="hover:text-white hover:bg-red-500 rounded"
                            onClick={() => setFormVisible(false)}
                        />
                    </div>{' '}
                    <h1 className="text-[1.3rem] roboto-bold text-center">
                        Đăng tin cho thuê
                    </h1>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="mt-3 roboto-regular"
                    >
                        <div className="">
                            <div className="roboto-bold">Tiêu đề:</div>
                            <input
                                {...register('title', { required: true })}
                                type="text"
                                className="px-2 py-1 mt-1 rounded-[10px] border-[1px] outline-none w-full"
                            />
                        </div>

                        <div className="mt-3">
                            <div className="roboto-bold">Chủ sở hữu:</div>
                            <input
                                type="text"
                                {...register('ownerName', { required: true })}
                                className="px-2 py-1 mt-1 rounded-[10px] border-[1px] outline-none w-full"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-3">
                            <div className="col-span-1  grid grid-cols-4 gap-1">
                                <label className="roboto-bold">
                                    SDT liên hệ:{' '}
                                </label>
                                <input
                                    type="text"
                                    {...register('contactNumber', {
                                        required: true,
                                        minLength: 9,
                                    })}
                                    className="col-span-3 px-2 py-1 rounded-[10px] border-[1px] outline-none w-full"
                                />
                            </div>
                            <div className="col-span-1 grid grid-cols-4 gap-1">
                                <label className="roboto-bold col-span-1 ">
                                    Email liên hệ:{' '}
                                </label>
                                <input
                                    type="email"
                                    {...register('contactEmail', {
                                        required: true,
                                    })}
                                    className=" col-span-3 px-2 py-1 rounded-[10px] border-[1px] outline-none "
                                />
                            </div>
                        </div>
                        {/* <div className="mt-3 ">
                            <div className="roboto-bold">Loại phòng: </div>
                            <div className=" grid grid-cols-5 gap-2 mt-1">
                                <div className="col-span-1 ">
                                    <input
                                        type="radio"
                                        checked={typeRoom === 1}
                                        onChange={() => setTypeRoom(1)}
                                        className="hidden"
                                    />

                                    <label
                                        className={`cursor-pointer mt-1  ${
                                            typeRoom === 1
                                                ? 'bg-rootColor text-white'
                                                : 'bg-white border-2'
                                        } rounded-[10px] py-1 px-2`}
                                        onClick={() => handleClickType(1)}
                                        style={{ userSelect: 'none' }}
                                    >
                                        Phòng đơn
                                    </label>
                                </div>
                            </div>
                        </div> */}
                        <div className="mt-3">
                            <div className="roboto-bold">Mô tả:</div>
                            <textarea
                                {...register('description', { required: true })}
                                name="description"
                                className="min-h-[10rem] w-full mt-1 border-2 outline-none rounded"
                            ></textarea>
                        </div>
                        <div className="mt-3 flex items-center">
                            <div className="flex items-center ">
                                <div className="roboto-bold">Giá:</div>
                                <input
                                    type="number"
                                    {...register('price', {
                                        required: true,
                                        min: 100000,
                                    })}
                                    className="ml-1 mt-1 border-2 outline-none rounded-[10px] px-2 py-1"
                                />
                            </div>
                            <div className="flex items-center ml-3 ">
                                <div className="roboto-bold">Diện tích :</div>
                                <input
                                    type="number"
                                    {...register('acreage', {
                                        required: true,
                                        min: 1,
                                    })}
                                    className="ml-1 mt-1 border-2 outline-none rounded-[10px] px-2 py-1"
                                />
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="flex items-end">
                                <div className="roboto-bold">Hình ảnh:</div>
                                <p className="ml-2 text-[#ccc] text-[0.9rem]">
                                    (Phải bao gồm hình ảnh mặt tiền, các phòng,
                                    nhà vệ sinh, chỗ nấu ăn nếu có, đường ngõ
                                    liền kề )
                                </p>
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={handleImageChange}
                                ref={uploadImage}
                            />
                            <div className="flex items-center">
                                <div className="grid grid-cols-5 gap-2 mt-1">
                                    {changeImage.map((file, index) => (
                                        <div
                                            className="col-span-1 relative"
                                            key={index}
                                        >
                                            <Image
                                                src={file}
                                                alt=""
                                                width={100}
                                                height={100}
                                                className="w-[10rem] h-[10rem] rounded-[10px] "
                                            ></Image>
                                            <IoCloseCircleOutline
                                                onClick={() =>
                                                    handleRemoveImage(index)
                                                }
                                                className="absolute top-0 right-0 rounded-full bg-white text-[1.3rem]"
                                            />
                                        </div>
                                    ))}
                                    <div
                                        onClick={() => {
                                            if (uploadImage.current) {
                                                uploadImage.current.click();
                                            }
                                        }}
                                        className="border-2 w-[10rem] h-[10rem] rounded-[10px] flex items-center justify-center border-dashed text-[2rem]"
                                    >
                                        <FiPlus />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-3 roboto-bold">
                            <h1 className="roboto-bold">Vị trí: </h1>
                            <LocationInput />
                            <input
                                className="px-2 py-1 mt-2 border-2 rounded-[10px] outline-none"
                                type="text"
                            />
                            <div className="mt-2 w-full flex items-center">
                                <input
                                    {...register('location', {
                                        required: true,
                                    })}
                                    type="text"
                                    className="rounded-[10px] px-2 py-1 border-2 outline-none w-[80%]"
                                />
                                <div
                                    onClick={searchMap}
                                    className="ml-2 bg-rootColor cursor-pointer text-white px-2 py-1 rounded-[10px] hover:bg-[#699ba3c2]"
                                >
                                    Tìm kiếm
                                </div>
                            </div>
                            {coords && (
                                <div className="w-full rounded h-[400px] mt-1 ">
                                    <CustomerMap
                                        longitude={coords?.longitude}
                                        latitude={coords?.latitude}
                                        setCoord={setCoords}
                                    />
                                </div>
                            )}
                            {error && (
                                <div className="text-red-600 roboto-light-italic">
                                    {error}
                                </div>
                            )}
                        </div>
                        <button className="px-2 py-1 rounded-[10px] bg-rootColor hover:bg-[#699ba3] text-white mt-3">
                            Đăng tin
                        </button>
                    </form>
                </div>
            </div>
            <Toaster position="top-right" />
        </div>
    );
};

export default PostRoom;
