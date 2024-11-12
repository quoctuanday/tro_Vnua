const mongoose = require('mongoose');
const User = require('./User');
const Schema = mongoose.Schema;

const RoomListing = new RoomListing(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: User },
        title: { type: String, required: true },
        ownerName: { type: String, required: true },
        contactNumber: { type: String, required: true },
        contactEmail: { type: String },
        description: { type: String, required: true },
        location: { type: String, required: true },
        image: { type: [String], required: true },
        price: { type: Number, required: true },
        isAvailable: { type: Boolean, required: true, default: false },
    },
    { timestamp: true }
);

module.exports = mongoose.model('RoomListing', RoomListing);
