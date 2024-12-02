export type Category = {
    _id: string;
    name: string;
    children: {
        name: string;
        roomIds: string[];
    }[];
};
