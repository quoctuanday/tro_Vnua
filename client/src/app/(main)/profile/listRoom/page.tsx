'use client';
import PostRoom from '@/components/PostRoom';
import React, { useState } from 'react';
import { MdAddBox } from 'react-icons/md';

function ListRoomPage() {
    const [formVisible, setFormVisible] = useState(false);
    return (
        <div className="p-[1.3rem] roboto-regular">
            <div className="flex items-center text-[1.3rem]">
                <h1 className="roboto-bold">Bài đăng cho thuê</h1>
                <div
                    onClick={() => {
                        setFormVisible(true);
                    }}
                >
                    <MdAddBox className="ml-2 hover:text-rootColor " />
                </div>
            </div>
            {formVisible && <PostRoom setFormVisible={setFormVisible} />}
        </div>
    );
}

export default ListRoomPage;
