const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Category = new Schema({
    name: { type: String, required: true },
    child: [
        {
            name: { type: String },
            roomId: [
                { type: mongoose.Schema.Types.ObjectId, ref: RoomListing },
            ],
        },
    ],
});
module.exports = mongoose.model('Category', Category);
