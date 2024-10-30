const mongoose = require('mongoose');
const { DB_URL } = require('../env');

async function connect() {
    try {
        await mongoose.connect(DB_URL);
        console.log('Connect successfully');
    } catch (error) {
        console.log('Connect failue');
    }
}

module.exports = { connect };
