const mongoose = require('mongoose');
const User = require('./User');
const Room = require('./Room');
const Roommate = require('./Roommate');
const Schema = mongoose.Schema;
const FavouriteRoom = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: User },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: Room },
    roommateId: { type: mongoose.Schema.Types.ObjectId, ref: Roommate },
});
module.exports = mongoose.model('FavouriteRoom', FavouriteRoom);
