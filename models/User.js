/* imports */
const mongoose = require('mongoose');

/* User Schema */
const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            // Email must match typical email format: xxx@yyy.zzz
            match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
        },
        password: {
            type: String,
            required: true,
        },
        foodbooks: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Foodbook',
        }],
        recipes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Recipe',
        }],
    },
    {timestamps: true}
);

// remove user's password from json response
userSchema.set("toJSON", {
    transform: (doc, ret, opt) => {
        delete ret["password"];
        return ret;
    },
});

const User = mongoose.model('User', userSchema);

module.exports = User;