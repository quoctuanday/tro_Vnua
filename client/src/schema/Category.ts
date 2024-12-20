export type Category = {
    _id: string;
    name: string;
    child: {
        _id: string;
        name: string;
        roomId?: string[];
        roommateId?: string[];
    }[];
};
