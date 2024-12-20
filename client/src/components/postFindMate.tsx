'use client';
import LocationInput from '@/components/locationInput';
import CustomerMap from '@/components/Map';
import { useUser } from '@/store/userData';
import getCoordinates from '@/utils/locationIntoCoordinates';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiPlus } from 'react-icons/fi';
import { IoClose, IoCloseCircleOutline } from 'react-icons/io5';
import { NumericFormat } from 'react-number-format';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import toast, { Toaster } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { storage } from '@/firebase/config';
import { createRoommate, getCategory, updateRoommatePersonal } from '@/api/api';
import { Roommate } from '@/schema/Roommate';
import { Category } from '@/schema/Category';

interface PostFindMateProps {
    setFormVisible: React.Dispatch<React.SetStateAction<boolean>>;
    action: boolean;
    roommates: Roommate[];
    roommateIndex: number;
}

type Coordinates = {
    latitude: number;
    longitude: number;
} | null;

const PostFindMate: React.FC<PostFindMateProps> = ({
    setFormVisible,
    action,
    roommates,
    roommateIndex,
}) => {
    const { userLoginData } = useUser();
    const { register, handleSubmit, getValues, setValue, watch } = useForm();
    const [category, setCategory] = useState<Category[]>([]);
    const [childCateId, setChildCateId] = useState<string[]>([]);
    const [files, setFiles] = useState<File[]>([]);
    const [changeImage, setChangeImage] = useState<string[]>([]);
    const [uploadImageURL, setUploadImageURL] = useState<string[]>([]);
    const uploadImage = useRef<HTMLInputElement>(null);
    const [coords, setCoords] = useState<Coordinates>(null);
    const [error, setError] = useState();
    const [location, setLocation] = useState('');
    const [urlSaveImages, setUrlSaveImages] = useState('');

    useEffect(() => {
        if (!action) {
            const roommate = roommates[roommateIndex];
            setValue('_id', roommate._id);
            setValue('title', roommate.title);
            setValue('convenience', roommate.convenience);
            setValue('require', roommate.require);
            setValue('userId', roommate.userId);
            setValue('ownerName', roommate.ownerName);
            setValue('contactNumber', roommate.contactNumber);
            setValue('contactEmail', roommate.contactEmail);
            setValue('price', roommate.price);
            setValue('numberOfPeople', roommate.numberOfPeople);
            setValue('acreage', roommate.acreage);
            setValue('location', roommate.location.name);
            setCoords({
                latitude: roommate.location.coordinates.latitude,
                longitude: roommate.location.coordinates.longitude,
            });

            setUrlSaveImages(roommate.urlSaveImages);
            const urls = roommate.images;

            if (Array.isArray(urls)) {
                setChangeImage(urls);
                setUploadImageURL(urls);
            } else {
                setUploadImageURL([urls]);
                setChangeImage([urls]);
            }
        } else {
            const getCategories = async () => {
                const response = await getCategory();
                if (response) {
                    const data = response.data.category;
                    console.log(data);
                    setCategory(data);
                }
            };
            getCategories();
        }
    }, [action, setValue, roommateIndex, roommates]);
    const addRoomIntoCategory = (id: string, categoryId: string) => {
        setChildCateId((prev) => {
            const filteredIds = prev.filter((id) => {
                // Tìm danh mục chứa child này
                const categoryContainsChild = category.some((cat) =>
                    cat.child.some(
                        (child) => child._id === id && cat._id !== categoryId
                    )
                );
                return categoryContainsChild;
            });

            // Nếu đã chọn child này, bỏ chọn nó; nếu chưa, thêm nó vào
            if (prev.includes(id)) {
                return filteredIds;
            } else {
                return [...filteredIds, id];
            }
        });
        console.log(childCateId);
    };

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
        if (!action) {
            setUploadImageURL((prevImages) =>
                prevImages.filter((_, i) => i !== index)
            );
        }
        setChangeImage((prevImages) =>
            prevImages.filter((_, i) => i !== index)
        );

        setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    const searchMap = async () => {
        console.log(location);
        const locationValue = getValues('location');
        const fullAddress = `${locationValue}, ${location}`;
        setValue('location', fullAddress);
        console.log(fullAddress);
        if (fullAddress) {
            getCoordinates(fullAddress)
                .then((coords: { latitude: number; longitude: number }) =>
                    setCoords(coords)
                )
                .catch((error) => setError(error.message));
        }
    };

    //submit form
    const onSubmit = async (data: unknown) => {
        console.log(data);
        if (!files) {
            toast.error('Chưa chọn ảnh!');
            return;
        }
        if (action) {
            const randomFolderName = uuidv4();
            const folderPath = `troVnua/${userLoginData?.userName}/roommate/${randomFolderName}`;
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
                const response = await createRoommate({
                    data,
                    userId,
                    childCateId,
                    folderPath,
                    successfulUploads,
                    coords,
                });
                if (response) {
                    toast.success('Đăng tin thành công!');
                    setFormVisible(false);
                }
            } catch (error) {
                console.error('Có lỗi xảy ra trong quá trình upload:', error);
            }
        } else {
            try {
                //Upload images
                const uploadImages = await Promise.all(
                    files.map(async (file) => {
                        const storageRef = ref(
                            storage,
                            `${urlSaveImages}/${file.name}`
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
                const uploadURL = [...uploadImageURL, ...successfulUploads];

                const userId = userLoginData?._id;

                const response = await updateRoommatePersonal({
                    data,
                    userId,
                    uploadURL,
                    coords,
                });
                if (response) {
                    toast.success('Chỉnh sửa thông tin thành công!');
                    setFormVisible(false);
                }
            } catch (error) {
                console.error('Có lỗi xảy ra trong quá trình upload:', error);
            }
        }
    };
    return (
        <div className="fixed flex items-center justify-center top-0 bottom-0 left-0 right-0 z-[9999]">
            <div
                className="absolute top-0 bottom-0 left-0 right-0  opacity-50 bg-[#ccc]"
                onClick={() => setFormVisible(false)}
            ></div>
            <div
                className="relative w-[54rem] h-[40rem] overflow-y-auto overflow-hidden min-h-[16rem] bg-white rounded-[10px] shadow-custom-light p-[1rem]
            [&::-webkit-scrollbar]:w-2
            [&::-webkit-scrollbar-track]:rounded-[10px]
             [&::-webkit-scrollbar-track]:bg-gray-100
            [&::-webkit-scrollbar-thumb]:rounded-[10px]
             [&::-webkit-scrollbar-thumb]:bg-gray-300"
            >
                <div className=" flex items-center justify-end text-[1.3rem] ">
                    <IoClose
                        className="hover:text-white hover:bg-red-500 rounded"
                        onClick={() => setFormVisible(false)}
                    />
                </div>{' '}
                <h1 className="text-[1.3rem] roboto-bold text-center">
                    Tìm người thuê cùng
                </h1>
                <form
                    className="mt-3 roboto-regular"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <div className="grid grid-cols-9">
                        <label className="col-span-1 flex items-center roboto-bold">
                            Tiêu đề:
                        </label>
                        <input
                            {...register('title', { required: true })}
                            type="text"
                            className="col-span-8 px-2 py-1 mt-1 rounded-[10px] border-[1px] outline-none w-full"
                        />
                    </div>
                    <div className="grid grid-cols-9 mt-3">
                        <label className="col-span-1 flex items-center roboto-bold">
                            Chủ sở hữu:
                        </label>
                        <input
                            {...register('ownerName', { required: true })}
                            type="text"
                            className="col-span-8 px-2 py-1 mt-1 rounded-[10px] border-[1px] outline-none w-full"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                        <div className="col-span-1  grid grid-cols-4 gap-1">
                            <label className="roboto-bold flex items-center">
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
                            <label className="roboto-bold col-span-1 flex items-center ">
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
                    <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                        <div className="col-span-1 col-start-1">
                            <label className="roboto-bold">
                                Số người ở ghép:
                            </label>
                            <NumericFormat
                                value={watch('numberOfPeople')}
                                onValueChange={(values) => {
                                    const { value } = values;
                                    setValue('numberOfPeople', Number(value), {
                                        shouldValidate: true,
                                    });
                                }}
                                allowNegative={false}
                                className="max-w-[4rem] border-b-2 ml-2 text-center outline-none"
                            />
                        </div>

                        <div className="col-span-2 col-start-2 flex justify-center">
                            <label className="roboto-bold">Giá thuê:</label>
                            <NumericFormat
                                value={watch('price')}
                                onValueChange={(values) => {
                                    const { value } = values;
                                    setValue('price', Number(value), {
                                        shouldValidate: true,
                                    });
                                }}
                                thousandSeparator="."
                                decimalSeparator=","
                                allowNegative={false}
                                className="max-w-[10rem] border-b-2 ml-2 text-center outline-none"
                            />
                            <span className="ml-1">/người 1 tháng</span>
                        </div>

                        {/* Diện tích */}
                        <div className="col-span-1">
                            <label className="roboto-bold">Diện tích:</label>
                            <NumericFormat
                                value={watch('acreage')}
                                onValueChange={(values) => {
                                    const { value } = values;
                                    setValue('acreage', Number(value), {
                                        shouldValidate: true,
                                    });
                                }}
                                allowNegative={false}
                                thousandSeparator="."
                                decimalSeparator=","
                                className="max-w-[4rem] border-b-2 ml-2 text-center outline-none"
                            />
                            <span>m&sup2;</span>
                        </div>
                    </div>
                    <div className="mt-3 ">
                        {category.length > 0 && (
                            <div className="">
                                <h1 className="roboto-bold">Danh mục:</h1>
                                {category.map((category) => (
                                    <div
                                        className="flex items-center mt-2"
                                        key={category._id}
                                    >
                                        <h1>{category.name}:</h1>
                                        {category.child.map((child) => (
                                            <div
                                                className="ml-2"
                                                key={child._id}
                                            >
                                                <div
                                                    onClick={() =>
                                                        addRoomIntoCategory(
                                                            child._id,
                                                            category._id
                                                        )
                                                    }
                                                    className={`px-2 rounded-[10px] py-1 border-[1px] transition-colors cursor-pointer duration-300
                                                            ${
                                                                childCateId.includes(
                                                                    child._id
                                                                )
                                                                    ? 'bg-rootColor text-white'
                                                                    : ''
                                                            }
                                                            `}
                                                >
                                                    {child.name}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="mt-3">
                        <label className="roboto-bold">Yêu cầu:</label>
                        <textarea
                            {...register('require', { required: true })}
                            name="require"
                            className="w-full min-h-[10rem] border-2 rounded"
                        ></textarea>
                    </div>
                    <div className="mt-3">
                        <label className="roboto-bold">Tiện nghi:</label>
                        <textarea
                            {...register('convenience', { required: true })}
                            name="convenience"
                            className="w-full min-h-[10rem] border-2 rounded"
                        ></textarea>
                    </div>
                    <div className="mt-3">
                        <div className="flex items-end">
                            <div className="roboto-bold">Hình ảnh:</div>
                            <p className="ml-2 text-[#ccc] text-[0.9rem]">
                                (Phải bao gồm hình ảnh mặt tiền, các phòng, nhà
                                vệ sinh, chỗ nấu ăn nếu có, đường ngõ liền kề )
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
                        {action && (
                            <div>
                                <LocationInput setLocation={setLocation} />
                                <h1 className="mt-2 ">Ngõ đường:</h1>
                            </div>
                        )}
                        <div className="w-full grid grid-cols-5 gap-3">
                            <div className="w-full col-span-4">
                                <input
                                    {...register('location', {
                                        required: true,
                                    })}
                                    placeholder="VD:Ngõ 64, phố Ngô Xuân Quảng, An Lạc"
                                    type="text"
                                    className="rounded-[10px] w-full mt-1 px-2 py-1 border-2 outline-none"
                                />
                            </div>
                            <div
                                onClick={searchMap}
                                className="ml-2 col-span-1 text-center mt-2 bg-rootColor cursor-pointer text-white px-2 py-1 rounded-[10px] hover:bg-[#699ba3c2]"
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
                    <button
                        type="submit"
                        className="px-2 py-1 rounded-[10px] bg-rootColor hover:bg-[#699ba3] text-white mt-3"
                    >
                        {action ? 'Đăng tin' : 'Chỉnh sửa'}
                    </button>
                </form>
            </div>
            <Toaster position="top-right" />
        </div>
    );
};

export default PostFindMate;
