export type User = {
    _id: string;
    userName: string;
    password: string;
    image?: string;
    email: string;
    gender?: string;
    phoneNumber?: string;
    DOB?: Date;
    role: string;
    isBlocked: boolean;
    createdAt?: string;
    updatedAt?: string;
};
