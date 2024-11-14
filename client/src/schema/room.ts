export type Room = {
    _id: string;
    userId: string;
    title: string;
    images: string;
    ownerName: string;
    contactNumber: string;
    contactEmail: string;
    description: string;
    location: string;
    urlSaveImages: string;
    price: number;
    isAvailable: boolean;
    createdAt?: string;
    updatedAt?: string;
};
