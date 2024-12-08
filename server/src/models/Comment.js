const mongoose = require('mongoose');
const User = require('./User');
const mongooseDelete = require('mongoose-delete');
const Room = require('./Room');
const Schema = mongoose.Schema;
const Comment = new Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: User },
        roomId: { type: mongoose.Schema.Types.ObjectId, ref: Room },
        content: { type: String, required: true },
        rate: { type: Number, required: true },
    },
    { timestamps: true }
);
Comment.plugin(mongooseDelete, { overrideMethods: 'all' });

module.exports = mongoose.model('Comment', Comment);