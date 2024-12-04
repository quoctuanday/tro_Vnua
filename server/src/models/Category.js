const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Room = require('./Room');
const Category = new Schema({
    name: { type: String, required: true },
    child: [
        {
            name: { type: String },
            roomId: [{ type: mongoose.Schema.Types.ObjectId, ref: Room }],
        },
    ],
});
module.exports = mongoose.model('Category', Category);
