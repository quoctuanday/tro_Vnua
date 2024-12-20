export type Room = {
    _id: string;
    userId: string;
    userName?: string;
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
    isCheckout?: boolean;
    urlSaveImages: string;
    price: number;
    acreage: number;
    rate: number;
    isAvailable: boolean;
    createdAt?: string;
    updatedAt?: string;
};
