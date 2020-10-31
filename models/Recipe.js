const mongoose = require('mongoose');

module.exports = mongoose.model('Recipe', new mongoose.Schema(
    {
        edamam_id: {
            type: String,
            required: true,
            unique: true,
        },
        recipe_type: {
            type: String,
            required: true,
        },
        foodbooks: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Foodbook',
        }],
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {timestamps: true},
));