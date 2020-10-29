const mongoose = require('mongoose');

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
            match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/, // Email must match typical email format: xxx@yyy.zzz
        },
        password: {
            type: String,
            required: true,
        },
        foodbooks: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Foodbooks',
        }],
    },
    {timestamps: true}
);

userSchema.set("toJSON", {
    transform: (doc, ret, opt) => {
        delete ret["password"];
        return ret;
    },
});

const User = mongoose.model('User', userSchema);

module.exports = User;