/* imports */
const mongoose = require('mongoose');

/* Recipe Schema */
module.exports = mongoose.model('Recipe', new mongoose.Schema(
    {
        edamam_id: {
            type: String,
            required: true,
            unique: true,
        },
        name: {
            type: String,
            required: true,
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