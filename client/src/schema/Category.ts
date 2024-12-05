export type Category = {
    _id: string;
    name: string;
    child: {
        name: string;
        roomId?: string[];
    }[];
};
