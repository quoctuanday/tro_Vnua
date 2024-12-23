const User = require('../models/User');
const Room = require('../models/Room');
const Roommate = require('../models/Roommate');
const News = require('../models/News');

class AdminController {
    async getTotal(req, res) {
        try {
            const { start, end } = req.query;
            console.log(start, end);
            const userCountPromise = User.countDocuments({
                createdAt: { $gte: start, $lte: end },
            });
            const RoomCountPromise = Room.countDocuments({
                createdAt: { $gte: start, $lte: end },
            });
            const RoommateCountPromise = Roommate.countDocuments({
                createdAt: { $gte: start, $lte: end },
            });
            const availableRoomCountPromise = Room.countDocuments({
                isAvailable: true,
                createdAt: { $gte: start, $lte: end },
            });

            const unavailableRoomCountPromise = Room.countDocuments({
                isAvailable: false,
                createdAt: { $gte: start, $lte: end },
            });
            const availableRoommateCountPromise = Roommate.countDocuments({
                isAvailable: true,
                createdAt: { $gte: start, $lte: end },
            });

            const unavailableRoommateCountPromise = Roommate.countDocuments({
                isAvailable: false,
                createdAt: { $gte: start, $lte: end },
            });
            const NewsCountPromise = News.countDocuments({
                createdAt: { $gte: start, $lte: end },
            });
            const paidRoomRevenuePromise = Room.aggregate([
                {
                    $match: {
                        isCheckout: true,
                        createdAt: {
                            $gte: new Date(start),
                            $lte: new Date(end),
                        },
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: 10000 },
                    },
                },
            ]);

            const paidRoommateRevenuePromise = Roommate.aggregate([
                {
                    $match: {
                        isCheckout: true,
                        createdAt: {
                            $gte: new Date(start),
                            $lte: new Date(end),
                        },
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: 10000 },
                    },
                },
            ]);

            Promise.all([
                paidRoomRevenuePromise,
                paidRoommateRevenuePromise,
                userCountPromise,
                RoomCountPromise,
                availableRoomCountPromise,
                unavailableRoomCountPromise,
                RoommateCountPromise,
                availableRoommateCountPromise,
                unavailableRoommateCountPromise,
                NewsCountPromise,
            ]).then(
                ([
                    paidRoomRevenue,
                    paidRoommateRevenue,
                    userCount,
                    roomCount,
                    availableRoomCount,
                    unavailableRoomCount,
                    roommateCount,
                    availableRoommateCount,
                    unavailableRoommateCount,
                    newsCount,
                ]) => {
                    const totalRevenue =
                        (paidRoomRevenue[0]?.totalRevenue || 0) +
                        (paidRoommateRevenue[0]?.totalRevenue || 0);
                    const data = {
                        totalRevenue: totalRevenue,
                        userCount: userCount,
                        roomCount: {
                            availableRoomCount: availableRoomCount,
                            unavailableRoomCount: unavailableRoomCount,
                        },
                        roommateCount: {
                            availableRoommateCount: availableRoommateCount,
                            unavailableRoommateCount: unavailableRoommateCount,
                        },
                        newsCount: newsCount,
                    };
                    res.status(200).json({ message: 'total :', data });
                }
            );
        } catch (error) {
            console.log('get count error: ', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
    showTotalAmounts(req, res, next) {
        const { start, end } = req.query;
        console.log('total revenue', start, end);
        const startDate = new Date(start);
        const endDate = new Date(end);

        const paidRoomRevenuePromise = Room.aggregate([
            {
                $match: {
                    isCheckout: true,
                    createdAt: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $group: {
                    _id: {
                        month: { $month: '$createdAt' },
                    },
                    totalRevenue: { $sum: 10000 },
                },
            },
            {
                $sort: {
                    '_id.month': 1,
                },
            },
        ]);
        const paidRoommateRevenuePromise = Roommate.aggregate([
            {
                $match: {
                    isCheckout: true,
                    createdAt: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $group: {
                    _id: {
                        month: { $month: '$createdAt' },
                    },
                    totalRevenue: { $sum: 10000 },
                },
            },
            {
                $sort: {
                    '_id.month': 1,
                },
            },
        ]);

        Promise.all([paidRoomRevenuePromise, paidRoommateRevenuePromise])

            .then(([paidRevenue, paidRoommateRevenue]) => {
                res.json({
                    paidRevenue,
                    paidRoommateRevenue,
                });
            })
            .catch((error) => {
                console.error('Lỗi khi lấy dữ liệu:', error);
                next(error);
            });
    }
}
module.exports = new AdminController();
