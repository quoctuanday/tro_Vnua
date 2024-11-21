'use client';
import { createNews, updateNews } from '@/api/api';
import { News } from '@/schema/news';
import { Editor } from '@tinymce/tinymce-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

interface PostNewsProps {
    setFormVisible: React.Dispatch<React.SetStateAction<boolean>>;
    action: boolean;
    news: News[];
    newsIndex: number;
}

const PostNews: React.FC<PostNewsProps> = ({
    setFormVisible,
    action,
    news,
    newsIndex,
}) => {
    const { register, handleSubmit, setValue, watch } = useForm();

    useEffect(() => {
        if (action === false) {
            setValue('title', news[newsIndex].title);
            setValue('image', news[newsIndex].image);
            setValue('content', news[newsIndex].content);
            console.log(news[newsIndex]);
            console.log(newsIndex);
        }
    }, [action, setValue, newsIndex, news]);

    const extractFirstImageUrl = (htmlContent: string): string | null => {
        const regex = /<img[^>]+src="([^"]+)"/;
        const match = htmlContent.match(regex);
        return match ? match[1] : null;
    };
    const onSubmit = async (data: unknown) => {
        if (action) {
            console.log(data);
            const response = await createNews(data);
            if (response) {
                toast.success('Đăng tin thành công!');
                setFormVisible(false);
            } else {
                toast.error('Đăng tin thất bại!');
            }
        } else {
            console.log(data);
            const response = await updateNews({
                data,
                newsId: news[newsIndex]._id,
            });
            if (response) {
                toast.success('Chỉnh sửa thành công!');
                setFormVisible(false);
            } else {
                toast.error('Chỉnh sửa thất bại!');
            }
        }
    };

    return (
        <div className="fixed flex items-center justify-center top-1 bottom-0 left-0 right-0 z-[999]">
            <div
                onClick={() => setFormVisible(false)}
                className="absolute top-0 bottom-0 right-0 left-0 opacity-50 bg-[#ccc]"
            ></div>
            <div
                className="relative w-[52rem] max-h-[40rem] overflow-y-auto min-h-[16rem] bg-white rounded-[10px] shadow-custom-light p-[1rem]
            [&::-webkit-scrollbar]:w-2
            [&::-webkit-scrollbar-track]:rounded-[10px]
             [&::-webkit-scrollbar-track]:bg-gray-100
            [&::-webkit-scrollbar-thumb]:rounded-[10px]
             [&::-webkit-scrollbar-thumb]:bg-gray-300
            "
            >
                {action ? (
                    <h1 className="text-[1.3rem] roboto-bold text-center">
                        Đăng tin tức
                    </h1>
                ) : (
                    <h1 className="text-[1.3rem] roboto-bold text-center">
                        Chỉnh sửa tin tức
                    </h1>
                )}
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="mt-3 roboto-regular"
                >
                    <div className="">
                        <div className="">
                            <div className="roboto-bold">Tiêu đề:</div>
                            <input
                                {...register('title', { required: true })}
                                type="text"
                                className="px-2 py-1 mt-1 rounded-[10px] border-[1px] outline-none w-full"
                            />
                            <input
                                {...register('image')}
                                type="hidden"
                                className="px-2 py-1 mt-1 rounded-[10px] border-[1px] outline-none w-full"
                            />
                        </div>

                        <div className="mt-3 ">
                            <input type="hidden" {...register('content')} />
                            <div className="roboto-bold">Nội dung:</div>
                            <Editor
                                apiKey="nnplqoe94p83xkbl9cqz5osr7xcapr0b13vfukxyhmmzp9nr"
                                init={{
                                    height: 300,
                                    menubar: true,
                                    plugins: [
                                        'advlist',
                                        'autolink',
                                        'lists',
                                        'link',
                                        'image',
                                        'charmap',
                                        'preview',
                                        'anchor',
                                    ],
                                    toolbar:
                                        'undo redo | formatselect | bold italic backcolor | \
                                alignleft aligncenter alignright alignjustify | \
                                bullist numlist outdent indent | removeformat | help',
                                }}
                                value={watch('content')}
                                onEditorChange={(content: string) => {
                                    setValue('content', content);
                                    const defaultImage =
                                        'https://firebasestorage.googleapis.com/v0/b/web-novel-e3a0a.appspot.com/o/troVnua%2FQuoc%20Tuan%2Froom%2Fe3bd0c0d-aa47-4108-ac03-032163cbef12%2Fdefault.jpg?alt=media&token=a8df6f56-53cd-413c-a54d-8ac6b0f79a74';
                                    const firstImageUrl =
                                        extractFirstImageUrl(content);
                                    if (firstImageUrl) {
                                        setValue('image', firstImageUrl);
                                    } else {
                                        setValue('image', defaultImage);
                                    }
                                }}
                            />
                        </div>
                        <button className="px-2 py-1 rounded bg-rootColor hover:bg-[#699ba3] text-white mt-3 ">
                            Đăng tin
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostNews;
