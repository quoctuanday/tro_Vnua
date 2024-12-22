const mongoose = require('mongoose');
const User = require('./User');
const mongooseDelete = require('mongoose-delete');
const Schema = mongoose.Schema;

const Roommate = new Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: User },
        title: { type: String, required: true },
        ownerName: { type: String, required: true },
        contactNumber: { type: String, required: true },
        contactEmail: { type: String },
        convenience: { type: String, required: true },
        require: {
            gender: { type: String },
            age: {
                min: { type: Number },
                max: { type: Number },
            },
            other: { type: String },
        },
        location: {
            name: { type: String, required: true },
            coordinates: {
                latitude: { type: Number, required: true },
                longitude: { type: Number, required: true },
            },
        },
        acreage: { type: Number, required: true },
        images: { type: [String], required: true },
        urlSaveImages: { type: String },
        price: { type: Number, required: true },
        numberOfPeople: { type: Number, required: true },
        isAvailable: { type: Boolean, required: true, default: false },
        isCheckout: { type: Boolean, required: true, default: false },
        rate: { type: Number, default: 0 },
    },
    { timestamps: true }
);
Roommate.plugin(mongooseDelete, { overrideMethods: 'all' });

module.exports = mongoose.model('Roommate', Roommate);
