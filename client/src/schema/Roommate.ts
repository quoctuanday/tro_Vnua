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
    require: {
        gender: string;
        age: {
            min: number;
            max: number;
        };
        other: string;
    };
    description: string;
    location: {
        name: string;
        linkMap: string;
        coordinates: {
            latitude: number;
            longitude: number;
        };
    };
    feedBack?: string;
    isCheckout?: boolean;
    urlSaveImages: string;
    price: number;
    numberOfPeople: number;
    acreage: number;
    rate: number;
    isAvailable: boolean;
    createdAt?: string;
    updatedAt?: string;
};
