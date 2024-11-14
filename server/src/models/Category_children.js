const mongoose = require('mongoose');
const Category = require('./Category');
const Schema = mongoose.Schema;
const CategoryChild = new Schema({
    cateParents: { type: mongoose.Schema.Types.ObjectId, ref: Category },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: RoomListing },
    name: { type: String, required: true },
});
module.exports = mongoose.model('CategoryChild', CategoryChild);
