import React from 'react';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
interface Props {
    currentPage: number;
    totalPage: number;
    onPageChange: React.Dispatch<React.SetStateAction<number>>;
}

function Pagination({ currentPage, totalPage, onPageChange }: Props) {
    const handlePageClick = (page: number) => {
        if (page >= 1 && page <= totalPage) {
            onPageChange(page);
        }
    };
    return (
        <div className="flex justify-center items-center mt-8 pb-8">
            <button
                className="px-2 py-1 min-h-[2rem] border bg-gray-200 mx-1 rounded-[10px]"
                onClick={() => handlePageClick(currentPage - 1)}
                disabled={currentPage === 1}
            >
                <IoIosArrowBack />
            </button>

            {Array.from({ length: totalPage }, (_, index) => (
                <button
                    key={index}
                    className={`px-3 py-1 min-h-[2rem] border mx-1 rounded-[10px] ${
                        currentPage === index + 1
                            ? 'bg-rootColor text-white'
                            : 'bg-gray-200'
                    }`}
                    onClick={() => handlePageClick(index + 1)}
                >
                    {index + 1}
                </button>
            ))}

            <button
                className="px-2 py-1 min-h-[2rem] border bg-gray-200 mx-1 rounded-[10px]"
                onClick={() => handlePageClick(currentPage + 1)}
                disabled={currentPage === totalPage}
            >
                <IoIosArrowForward />
            </button>
        </div>
    );
}

export default Pagination;
