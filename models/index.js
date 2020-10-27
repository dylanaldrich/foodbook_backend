const mongoose = require('mongoose');

const connectionString = 'mongodb://localhost:27017/foodbook-db';

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

mongoose.connection.on('disconnected', () => {
    console.log("MongoDB is disconnected.");
});

module.exports = {
    Foodbook: require('./Foodbook'),
    Recipe: require('./Recipe'),
    User: require('./User'),
};