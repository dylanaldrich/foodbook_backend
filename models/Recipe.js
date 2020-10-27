const mongoose = require('mongoose');
const User = require('./User');

const recipeSchema = new mongoose.Schema(
    {
        api_id: {
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
    },
    {timestamps = true},
);

const recipeModel = mongoose.model('Recipe', recipeSchema)

module.exports = recipeModel;