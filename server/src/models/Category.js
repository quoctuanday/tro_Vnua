const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Room = require('./Room');
const Roommate = require('./Roommate');
const Category = new Schema({
    name: { type: String, required: true },
    child: [
        {
            name: { type: String },
            roomId: [{ type: mongoose.Schema.Types.ObjectId, ref: Room }],
            roommateId: [
                { type: mongoose.Schema.Types.ObjectId, ref: Roommate },
            ],
        },
    ],
});
module.exports = mongoose.model('Category', Category);
