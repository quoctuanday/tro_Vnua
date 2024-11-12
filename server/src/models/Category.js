const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Category = new Category({
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: RoomListing },
    name: { type: String, required: true },
});
module.exports = mongoose.model('Category', Category);
