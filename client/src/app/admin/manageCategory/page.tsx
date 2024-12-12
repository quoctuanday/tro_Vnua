'use client';
import {
    createCategory,
    deleteCategory,
    getCategory,
    updateCategory,
} from '@/api/api';
import { Category } from '@/schema/Category';
import { useUser } from '@/store/userData';
import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { BsThreeDots } from 'react-icons/bs';
import { FaSpinner } from 'react-icons/fa';
import {
    IoMdAddCircleOutline,
    IoMdArrowDropdown,
    IoMdArrowDropright,
} from 'react-icons/io';
import { IoTrashBin } from 'react-icons/io5';
import { MdCancel, MdCheckCircle } from 'react-icons/md';

function ManageCategoryPage() {
    const { socket } = useUser();
    const [category, setCategory] = useState<Category[] | null>(null);
    const inputAddRef = useRef<HTMLInputElement>(null);
    const inputAddSubCateRef = useRef<HTMLInputElement>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
        null
    );
    const [categoryIdDeleted, setCategoryIdDeleted] = useState<string | null>(
        null
    );
    const [childDeleted, setChildDeleted] = useState<number | null>(null);
    const [categoryId, setCategoryId] = useState<string[]>([]);
    const [addSubCategory, setAddSubCategory] = useState<string | null>(null);

    useEffect(() => {
        const getData = async () => {
            const response = await getCategory();
            if (response) {
                const data = response.data.category;
                console.log(data);
                setCategory(data);
            }
        };
        getData();
        if (!socket) return;
        socket.on('category-update', () => {
            console.log('Category updated');
            getData();
        });
    }, [socket]);
    const handleAddCate = async () => {
        if (inputAddRef.current) {
            const response = await createCategory(inputAddRef.current.value);
            if (response) {
                toast.success('Tạo danh mục thành công');
                inputAddRef.current.value = '';
            }
        }
    };

    const handleRemoveSubCate = async () => {
        if (childDeleted) {
            if (!category) return;
            const categoryToUpdate = category.find(
                (category) => category._id === categoryIdDeleted
            );

            if (!categoryToUpdate) {
                console.error('Danh mục không tồn tại');
                return null;
            }
            const updatedCategory = {
                ...categoryToUpdate,
                child: categoryToUpdate.child.filter(
                    (_, index) => index !== childDeleted
                ),
            };

            const response = await updateCategory(categoryIdDeleted, {
                updatedCategory,
            });
            if (response) {
                setCategoryIdDeleted(null);
                setChildDeleted(null);
                toast.success('Xóa danh mục thành công!');
            }
        } else {
            console.log(categoryIdDeleted);
            const response = await deleteCategory(categoryIdDeleted);
            if (response) {
                setCategoryIdDeleted(null);
                setChildDeleted(null);
                toast.success('Xóa danh mục thành công!');
            }
        }
    };
    const handleAddSubCate = async () => {
        if (inputAddSubCateRef.current && category) {
            const categoryToUpdate = category.find(
                (category) => category._id === addSubCategory
            );

            if (!categoryToUpdate) {
                console.error('Danh mục không tồn tại');
                return;
            }
            const dataChild = {
                name: inputAddSubCateRef.current.value,
            };
            const updatedCategory = {
                ...categoryToUpdate,
                child: [...categoryToUpdate.child, dataChild],
            };
            const response = await updateCategory(addSubCategory, {
                updatedCategory,
            });
            if (response) {
                setCategoryIdDeleted(null);
                setChildDeleted(null);
                toast.success('Tạo danh mục thành công!');
                setAddSubCategory(null);
                inputAddSubCateRef.current.value = '';
            }
        }
    };
    return (
        <div>
            <div className="h-[3rem] flex items-center justify-between px-2">
                <div className="relative w-[30%]">
                    <input
                        ref={inputAddRef}
                        type="text"
                        placeholder="Danh mục mới"
                        className="rounded-[10px] w-full px-2 py-1 outline-none"
                    />
                    <button
                        onClick={handleAddCate}
                        className="flex items-center text-white absolute top-0 bottom-0 right-0 rounded-r-[10px] bg-rootColor hover:bg-[#699ba3b8] px-2 py-1"
                    >
                        Add
                    </button>
                </div>
            </div>
            <div className="">
                {category ? (
                    <div className="">
                        {category.length > 0 ? (
                            <div className="min-h-[39rem] max-h-[40rem] overflow-y-auto">
                                {category.map((category) => (
                                    <div
                                        key={category._id}
                                        className={` ${
                                            categoryId.includes(category._id) &&
                                            'pb-[1.5rem]'
                                        }`}
                                    >
                                        <div className="border-[1px] border-l-0 bg-white flex items-center justify-between px-2 py-1">
                                            <div className="flex items-center">
                                                <button
                                                    onClick={() =>
                                                        setCategoryId((prev) =>
                                                            prev.includes(
                                                                category._id
                                                            )
                                                                ? prev.filter(
                                                                      (catId) =>
                                                                          catId !==
                                                                          category._id
                                                                  )
                                                                : [
                                                                      ...prev,
                                                                      category._id,
                                                                  ]
                                                        )
                                                    }
                                                    className="pr-1"
                                                >
                                                    {categoryId.includes(
                                                        category._id
                                                    ) ? (
                                                        <IoMdArrowDropdown />
                                                    ) : (
                                                        <IoMdArrowDropright />
                                                    )}
                                                </button>
                                                {category.name}
                                            </div>
                                            <div className="relative">
                                                <button
                                                    onClick={() =>
                                                        setSelectedCategoryId(
                                                            selectedCategoryId ===
                                                                category._id
                                                                ? null
                                                                : category._id
                                                        )
                                                    }
                                                    className=""
                                                >
                                                    <BsThreeDots />
                                                </button>
                                                {selectedCategoryId ===
                                                    category._id && (
                                                    <div className="absolute z-[10] border-2 w-[12rem] h-[5rem] bg-white top-[80%] right-[100%] rounded">
                                                        <div
                                                            onClick={() =>
                                                                setAddSubCategory(
                                                                    category._id
                                                                )
                                                            }
                                                            className="p-2 hover:bg-rootColor hover:text-white cursor-pointer flex items-center"
                                                        >
                                                            <IoMdAddCircleOutline />
                                                            <p className="ml-2">
                                                                Thêm danh mục
                                                                phụ
                                                            </p>
                                                        </div>
                                                        <div
                                                            onClick={() => {
                                                                setCategoryIdDeleted(
                                                                    category._id
                                                                );
                                                                setSelectedCategoryId(
                                                                    null
                                                                );
                                                            }}
                                                            className="p-2 hover:bg-rootColor hover:text-white cursor-pointer flex items-center"
                                                        >
                                                            <IoTrashBin />
                                                            <p className="ml-2">
                                                                Xóa danh mục
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {categoryId.includes(category._id) && (
                                            <ul className="pl-[1em]">
                                                {category.child && (
                                                    <div className="">
                                                        <li className="pl-[1em] border-dotted border-black border-l-[1px] border-b-[1px] h-[1.2rem]">
                                                            <div className="relative top-[0.1em] h-[2.1rem] bg-white px-2 py-1 rounded-l flex items-center justify-between w-full">
                                                                <div className="flex items-center justify-between w-full">
                                                                    {addSubCategory ===
                                                                    category._id ? (
                                                                        <div className="flex items-center justify-between w-full">
                                                                            <div className="flex items-center w-[70%]">
                                                                                <span>
                                                                                    Nhập
                                                                                    tên
                                                                                    danh
                                                                                    mục:
                                                                                </span>
                                                                                <input
                                                                                    ref={
                                                                                        inputAddSubCateRef
                                                                                    }
                                                                                    className="border-b-[1px] ml-2 outline-none w-[70%] border-dotted border-black"
                                                                                    type="text"
                                                                                />
                                                                            </div>
                                                                            <div className="flex items-center">
                                                                                <button
                                                                                    onClick={() =>
                                                                                        setAddSubCategory(
                                                                                            null
                                                                                        )
                                                                                    }
                                                                                    className="p-1 text-[1rem] rounded hover:text-red-500 "
                                                                                >
                                                                                    <MdCancel />
                                                                                </button>
                                                                                <button
                                                                                    onClick={() =>
                                                                                        handleAddSubCate()
                                                                                    }
                                                                                    className="p-1 text-[1rem] rounded ml-1 hover:text-green-400 "
                                                                                >
                                                                                    <MdCheckCircle />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <button
                                                                            onClick={() =>
                                                                                setAddSubCategory(
                                                                                    category._id
                                                                                )
                                                                            }
                                                                            className="px-2 py-1 hover:text-rootColor"
                                                                        >
                                                                            <IoMdAddCircleOutline />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </li>
                                                        {category.child.map(
                                                            (child, index) => {
                                                                const updatedChildName =
                                                                    child.name.replace(
                                                                        /m2/g,
                                                                        'm²'
                                                                    );
                                                                return (
                                                                    <li
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="pl-[1em] border-dotted border-black border-l-[1px] border-b-[1px]"
                                                                    >
                                                                        <div
                                                                            className={`relative top-[1.1em] bg-white px-2 py-1 rounded-l flex items-center justify-between`}
                                                                        >
                                                                            <span>
                                                                                {
                                                                                    updatedChildName
                                                                                }
                                                                            </span>
                                                                            <button
                                                                                onClick={() => {
                                                                                    setCategoryIdDeleted(
                                                                                        category._id
                                                                                    );
                                                                                    setChildDeleted(
                                                                                        index
                                                                                    );
                                                                                }}
                                                                                className="hover:text-red-400"
                                                                            >
                                                                                <IoTrashBin />
                                                                            </button>
                                                                        </div>
                                                                    </li>
                                                                );
                                                            }
                                                        )}
                                                    </div>
                                                )}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                                {categoryIdDeleted && (
                                    <div className=" fixed flex items-center justify-center top-0 left-0 right-0 bottom-0">
                                        <div
                                            className="absolute bg-[#ccc] top-0 left-0 right-0 bottom-0 opacity-50"
                                            onClick={() =>
                                                setCategoryIdDeleted(null)
                                            }
                                        ></div>
                                        <div className="relative flex items-center ">
                                            <div className="bg-white py-[3rem] w-[30rem] rounded flex flex-col items-center justify-center roboto-bold ">
                                                <span>
                                                    Bạn có chắc muốn xóa danh
                                                    mục này không?
                                                </span>
                                                <div className="flex items-center mt-2">
                                                    <button
                                                        onClick={() =>
                                                            setCategoryIdDeleted(
                                                                null
                                                            )
                                                        }
                                                        className="px-2 py-1 rounded bg-[#ccc]"
                                                    >
                                                        Hủy bỏ
                                                    </button>
                                                    <button
                                                        onClick={
                                                            handleRemoveSubCate
                                                        }
                                                        className="px-2 py-1 rounded bg-red-400 text-white ml-3"
                                                    >
                                                        Xóa
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center p-3 text-red-400">
                                <p>
                                    Chưa có danh mục nào cả! Vui lòng thêm danh
                                    mục.
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center justify-center p-3 h-[20rem] text-rootColor">
                        <FaSpinner className="spin" />
                    </div>
                )}
            </div>
        </div>
    );
}

export default ManageCategoryPage;
