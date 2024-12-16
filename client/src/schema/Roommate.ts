export type Roommate = {
    _id: string;
    userId: string;
    userName?: string;
    title: string;
    images: string;
    ownerName: string;
    contactNumber: string;
    convenience: string;
    contactEmail: string;
    require: string;
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
    numberOfPeople: number;
    acreage: number;
    rate: number;
    isAvailable: boolean;
    createdAt?: string;
    updatedAt?: string;
};
