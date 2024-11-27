export type Room = {
    _id: string;
    userId: string;
    title: string;
    images: string;
    ownerName: string;
    contactNumber: string;
    contactEmail: string;
    description: string;
    location: {
        name: string;
        coordinates: {
            latitude: number;
            longitude: number;
        };
    };
    urlSaveImages: string;
    price: number;
    acreage: number;
    isAvailable: boolean;
    createdAt?: string;
    updatedAt?: string;
};
