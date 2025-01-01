const mongoose = require('mongoose');
const User = require('./User');
const mongooseDelete = require('mongoose-delete');
const Schema = mongoose.Schema;

const Room = new Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: User },
        title: { type: String, required: true },
        ownerName: { type: String, required: true },
        contactNumber: { type: String, required: true },
        contactEmail: { type: String },
        description: { type: String, required: true },
        location: {
            name: { type: String, required: true },
            linkMap: { type: String },
            coordinates: {
                latitude: { type: Number, required: true },
                longitude: { type: Number, required: true },
            },
        },
        acreage: { type: Number, required: true },
        images: { type: [String], required: true },
        urlSaveImages: { type: String },
        price: { type: Number, required: true },
        isAvailable: { type: Boolean, required: true, default: false },
        isCheckout: { type: Boolean, required: true, default: false },
        rate: { type: Number, default: 0 },
        feedBack: { type: String },
    },
    { timestamps: true }
);
Room.plugin(mongooseDelete, { overrideMethods: 'all' });

module.exports = mongoose.model('Room', Room);
