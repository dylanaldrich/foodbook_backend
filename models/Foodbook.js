/* imports */
const mongoose = require('mongoose');

/* Foodbook Model */
module.exports = mongoose.model('Foodbook', new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        recipes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Recipe'
        }],
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {timestamps: true},
));