const mongoose = require('mongoose');

module.exports = mongoose.model('Foodbook', new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        recipes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Recipes'
        }],
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {timestamps: true},
));