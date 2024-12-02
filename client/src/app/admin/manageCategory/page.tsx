'use client';
import { Category } from '@/schema/Category';
import React, { useState } from 'react';

function ManageCategoryPage() {
    const [category, setCategory] = useState<Category[] | null>(null);
    return (
        <div>
            <div className="h-[3rem] flex items-center justify-between px-2"></div>
            <div className="bg-white h-[30rem]">
                {category ? (
                    <div className=""></div>
                ) : (
                    <div className="flex items-center justify-center p-3 text-red-400">
                        <p>Chưa có danh mục nào cả! Vui lòng thêm danh mục.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ManageCategoryPage;
