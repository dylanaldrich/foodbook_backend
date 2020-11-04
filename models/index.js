/* imports */
const mongoose = require('mongoose');
require('dotenv').config();

/* MongoDB connection */

const connectionString = process.env.MONGODB_URI;

// handle db connection
mongoose.connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
}).then(() => {
    console.log('MongoDB is connected.');
}).catch((error) => {
    console.log('MongoDB connection error: ', error);
});

// handle db disconnect
mongoose.connection.on('disconnected', () => {
    console.log("MongoDB is disconnected.");
});

module.exports = {
    Foodbook: require('./Foodbook'),
    Recipe: require('./Recipe'),
    User: require('./User'),
};