export type Comments = {
    _id: string;
    userId: string;
    roomId?: string;
    roommateId?: string;
    userName: string;
    image?: string;
    content: string;
    rate: number;
    createdAt?: string;
    updatedAt?: string;
};
