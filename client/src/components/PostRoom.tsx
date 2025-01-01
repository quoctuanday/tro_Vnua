'use client';
import CustomerMap from '@/components/Map';
import LocationInput from '@/components/locationInput';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { IoClose, IoCloseCircleOutline } from 'react-icons/io5';
import getCoordinates from '../utils/locationIntoCoordinates';
import { useForm } from 'react-hook-form';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import toast, { Toaster } from 'react-hot-toast';
import { useUser } from '@/store/userData';
import { v4 as uuidv4 } from 'uuid';
import { storage } from '@/firebase/config';
import { createRoom, getCategory } from '@/api/api';
import { Category } from '@/schema/Category';
import { NumericFormat } from 'react-number-format';
import { TfiReload } from 'react-icons/tfi';

//type
interface PostRoomProps {
    setFormVisible: React.Dispatch<React.SetStateAction<boolean>>;
}
type Coordinates = {
    latitude: number;
    longitude: number;
} | null;
const captions = [
    'Hình ảnh mặt tiền',
    'Phòng ngủ',
    'Nhà vệ sinh',
    'Chỗ nấu ăn',
    'Ngõ vào',
];

const PostRoom: React.FC<PostRoomProps> = ({ setFormVisible }) => {
    const { userLoginData } = useUser();
    const { register, handleSubmit, setValue, watch } = useForm();
    const [category, setCategory] = useState<Category[]>([]);
    const [childCateId, setChildCateId] = useState<string[]>([]);
    const [files, setFiles] = useState<File[]>([]);
    const [changeImage, setChangeImage] = useState<string[]>(Array(5).fill(''));
    const uploadImage = useRef<(HTMLInputElement | null)[]>([]);
    const [coords, setCoords] = useState<Coordinates>(null);
    const [error, setError] = useState('');
    const [location, setLocation] = useState('');
    const [captcha, setCaptcha] = useState('');
    const [isRoting, setIsRoting] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const streetRef = useRef<HTMLInputElement>(null);
    const roadRef = useRef<HTMLInputElement>(null);
    const addressRef = useRef<HTMLInputElement>(null);
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
        const getCategories = async () => {
            const response = await getCategory();
            if (response) {
                const data = response.data.category;
                console.log(data);
                setCategory(data);
            }
        };
        getCategories();
    }, []);

    //add categories
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
    const handleImageChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        index: number
    ) => {
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

            setChangeImage((prevFiles) => {
                const newFiles = [...prevFiles];
                newFiles[index] = imageUrls[0];
                return newFiles;
            });

            setFiles((prevFiles) => {
                const newFiles = [...prevFiles];
                newFiles[index] = validFiles[0];
                return newFiles;
            });

            console.log(files);
        }
    };

    const handleRemoveImage = (index: number) => {
        const newChangeImage = [...changeImage];
        newChangeImage[index] = '';
        setChangeImage(newChangeImage);
    };

    //set map
    const searchMap = async () => {
        console.log(location);
        if (!streetRef.current && !roadRef.current && !addressRef.current)
            return;
        const fullAddress = `${addressRef.current?.value}, ${roadRef.current?.value}, ${streetRef.current?.value}, ${location}`;
        const halfAddress = `${roadRef.current?.value} ${streetRef.current?.value}, ${location}`;
        setValue('location', fullAddress);
        console.log(fullAddress);
        console.log(halfAddress);
        if (halfAddress) {
            getCoordinates(halfAddress)
                .then((coords: { latitude: number; longitude: number }) =>
                    setCoords(coords)
                )
                .catch((error) => setError(error.message));
        }
    };

    //submit form
    const onSubmit = async (data: unknown) => {
        if (changeImage.includes('')) {
            console.log('Chưa có ảnh', changeImage);
            toast.error('Chưa chọn ảnh!');
            setError('Bạn chưa cung cấp đầy đủ ảnh!');
            return;
        }
        if (inputRef.current?.value !== captcha) {
            setError('Captcha không hợp lệ. Mời nhập lại!');
            return;
        }
        console.log(changeImage);
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
                childCateId,
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
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            addRoomIntoCategory(
                                                                child._id,
                                                                category._id
                                                            )
                                                        }
                                                        className={`px-2 rounded-[10px] py-1 border-[1px] transition-colors duration-300
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
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="mt-3">
                            <div className="roboto-bold">Mô tả:</div>
                            <textarea
                                {...register('description', { required: true })}
                                name="description"
                                className="min-h-[10rem] w-full mt-1 border-2 outline-none rounded"
                            ></textarea>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center ">
                                <div className="roboto-bold">Giá:</div>
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
                                    className="ml-1 mt-1 border-b-2 outline-none  text-center px-2 py-1"
                                />
                                <span>/1 tháng</span>
                            </div>
                            <div className="flex items-center ml-3 ">
                                <div className="roboto-bold">Diện tích :</div>
                                <NumericFormat
                                    value={watch('acreage')}
                                    onValueChange={(values) => {
                                        const { value } = values;
                                        setValue('acreage', Number(value), {
                                            shouldValidate: true,
                                        });
                                    }}
                                    thousandSeparator="."
                                    decimalSeparator=","
                                    allowNegative={false}
                                    className="ml-1 mt-1 border-b-2 outline-none text-center  px-2 py-1"
                                />
                                <span>m&sup2;</span>
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="flex items-end">
                                <div className="roboto-bold">Hình ảnh:</div>
                                <p className="ml-2 text-[#ccc] text-[0.9rem]">
                                    (Phải bao gồm hình ảnh mặt tiền, các phòng,
                                    nhà vệ sinh, chỗ nấu ăn nếu có, đường ngõ
                                    liền kề)
                                </p>
                            </div>
                            <div className="flex items-center">
                                <div className="grid grid-cols-4 w-full gap-2 mt-1">
                                    {Array.from({ length: 5 }).map(
                                        (_, index) => (
                                            <div
                                                className="col-span-1 relative"
                                                key={index}
                                            >
                                                {changeImage[index] ? (
                                                    <>
                                                        <div className="flex flex-col items-center justify-center">
                                                            <div className="relative">
                                                                <Image
                                                                    src={
                                                                        changeImage[
                                                                            index
                                                                        ]
                                                                    }
                                                                    alt={`image-${index}`}
                                                                    width={100}
                                                                    height={100}
                                                                    className="w-[10rem] h-[10rem] rounded-[10px]"
                                                                />
                                                                <IoCloseCircleOutline
                                                                    onClick={() =>
                                                                        handleRemoveImage(
                                                                            index
                                                                        )
                                                                    }
                                                                    className="absolute top-0 right-0 rounded-full bg-white text-[1.3rem]"
                                                                />
                                                            </div>
                                                            <p className="text-center">
                                                                {
                                                                    captions[
                                                                        index
                                                                    ]
                                                                }
                                                            </p>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center">
                                                        <div
                                                            onClick={() => {
                                                                if (
                                                                    uploadImage
                                                                        .current[
                                                                        index
                                                                    ]
                                                                ) {
                                                                    uploadImage.current[
                                                                        index
                                                                    ].click();
                                                                }
                                                            }}
                                                            className="border-2 w-[10rem] h-[10rem] rounded-[10px] flex items-center justify-center border-dashed text-[2rem]"
                                                        >
                                                            <FiPlus />
                                                        </div>
                                                        <p className="text-center">
                                                            {captions[index]}
                                                        </p>
                                                    </div>
                                                )}
                                                <input
                                                    key={index}
                                                    type="file"
                                                    ref={(el) =>
                                                        (uploadImage.current[
                                                            index
                                                        ] = el)
                                                    }
                                                    onChange={(e) =>
                                                        handleImageChange(
                                                            e,
                                                            index
                                                        )
                                                    }
                                                    className="hidden"
                                                    accept="image/*"
                                                />
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="mt-3 roboto-bold">
                            <h1 className="roboto-bold">Vị trí: </h1>
                            <LocationInput setLocation={setLocation} />
                            <div className="w-full grid grid-cols-3 gap-1 mt-2">
                                <div className="col-span-1 flex items-center">
                                    <span>Đường:</span>
                                    <input
                                        ref={streetRef}
                                        required
                                        placeholder="VD: Đường Trâu Quỳ"
                                        type="text"
                                        className=" ml-2 rounded-[10px]  mt-1 px-2 py-1 border-2 outline-none"
                                    />
                                </div>
                                <div className="col-span-1 flex items-center">
                                    <span>Ngõ:</span>
                                    <input
                                        ref={roadRef}
                                        required
                                        placeholder="VD: Ngõ 62"
                                        type="text"
                                        className=" ml-2 rounded-[10px]  mt-1 px-2 py-1 border-2 outline-none"
                                    />
                                </div>
                                <div className="col-span-1 flex items-center">
                                    <span>Số nhà:</span>
                                    <input
                                        ref={addressRef}
                                        required
                                        placeholder="VD: Nhà 2"
                                        type="text"
                                        className=" ml-2 rounded-[10px]  mt-1 px-2 py-1 border-2 outline-none"
                                    />
                                </div>
                            </div>
                            <div
                                onClick={searchMap}
                                className="ml-2 text-center mt-2 bg-rootColor cursor-pointer text-white px-2 py-1 rounded-[10px] hover:bg-[#699ba3c2]"
                            >
                                Tìm kiếm
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
                            <div className="mt-2 flex items-center">
                                <label>Liên kết google map:</label>
                                <input
                                    {...register('linkMap', { required: true })}
                                    type="text"
                                    className="ml-2 rounded-[10px]  mt-1 px-2 py-1 border-2 outline-none w-[80%]"
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
                                            className={`${
                                                isRoting ? 'spin' : ''
                                            }`}
                                        />
                                    </button>
                                </div>
                            </div>
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
