export type News = {
    _id: string;
    userId: string;
    title: string;
    image: string;
    content: string;
    isAvailable: boolean;
    createdAt?: string;
    updatedAt?: string;
};
