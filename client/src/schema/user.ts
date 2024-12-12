export type User = {
    _id: string;
    userName: string;
    password: string;
    image?: string;
    email: string;
    gender?: string;
    phoneNumber?: string;
    rate?: number;
    DOB?: Date;
    role: 'admin' | 'moderator' | 'user';
    isBlocked: boolean;
    createdAt?: string;
    updatedAt?: string;
};
