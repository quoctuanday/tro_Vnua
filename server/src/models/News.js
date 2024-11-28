const mongoose = require('mongoose');
const User = require('./User');
const mongooseDelete = require('mongoose-delete');
const Schema = mongoose.Schema;
const News = new Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: User },
        title: { type: String, required: true },
        content: { type: String, required: true },
        image: { type: String },
    },
    { timestamps: true }
);
News.plugin(mongooseDelete, { overrideMethods: 'all' });

module.exports = mongoose.model('News', News);
