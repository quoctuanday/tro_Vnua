const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const User = new Schema(
    {
        userName: { type: String, maxLength: 255 },
        password: { type: String, maxLength: 255, required: true },
        email: { type: String, maxlength: 255, required: true },
        image: { type: String, maxLength: 255 },
        gender: { type: String, enum: ['Nam', 'Nu'] },
        phoneNumber: { type: String, maxLength: 255 },
        DOB: { type: Date },
        role: { type: Boolean, required: true, default: false },
        isBlocked: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model('User', User);
