const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../models');
const jwt = require('jsonwebtoken');

// register route
router.post('/register', async (req, res) => {
    try {
        // upon register submit, verify that email is not in the db, otherwise prompt user to try again
        const foundUser = await db.User.findOne({email: req.body.email});

        if(foundUser) return res.send({message: 'A user with this email address already exists. Please try again.'});

        // validate password (stretch goal) -- Add in the password test fxn from here:
        // https://www.oreilly.com/library/view/regular-expressions-cookbook/9781449327453/ch04s19.html
        /* match: /^(?=.{8,32}$)(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).*/ // Password must have between 8-32 characters, and at least one of each: lowercase, Uppercase, number */

        // encrypt password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(req.body.password, salt);
        req.body.password = hash;

        // create new user in db, with encrypted password
        const createdUser = await db.User.create({...req.body, password: hash});

        // provide a success response and the new user's data
        return res
            .status(201)
            .json({status: 201, message: "success", createdUser});
    } catch (error) {
        return res
            .status(500)
            .json({
                status: 500,
                message: "Something went wrong. Please try again.",
            });
    }
});

// login route
router.post('/login', async (req, res) => {
    try {
        const foundUser = await db.User.findOne({email : req.body.email});

        console.log("foundUser: ", foundUser);

        if(foundUser === null) {
            return res.status(404).json({
                status: 404,
                message: "That user doesn't exist yet. Please register first."});
        }

        if(!foundUser) {
            return res.sendStatus(500).json({message: 'The username or password is incorrect.'});
        }

        const match = await bcrypt.compare(req.body.password, foundUser.password);

        if(!match) {
            return res.sendStatus(500).json({message: 'The username or password is incorrect.'});
        } else {
            const signedJwt = await jwt.sign(
                {
                    _id: foundUser._id,
                },
                'super_secret_key',
                {
                    expiresIn: '5h',
                }
            );

            return res.status(200).json({
                status: 200,
                message: 'Success',
                id: foundUser._id,
                signedJwt,
            });
        }
    } catch (error) {
        return res
            .status(500)
            .json({
                status: 500,
                message: "Something went wrong. Please try again.",
                error: error,
            });
    }
});


// logout route
// handled on the frontend by deleting token from local storage


module.exports = router;