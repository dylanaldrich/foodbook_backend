/* imports */
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../models');
const jwt = require('jsonwebtoken');

/* Auth Routes */

// register route
router.post('/register', async (req, res) => {
    try {
        // upon register submit, verify that email is not in the db, otherwise prompt user to try again/login
        const foundUser = await db.User.findOne({email: req.body.email});
        if(foundUser) return res.send({message: 'A user with this email address already exists. Please log in, or register with a different email address.'});

        // encrypt password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(req.body.password, salt);
        req.body.password = hash;

        // create new user in db, with encrypted password
        const createdUser = await db.User.create({...req.body, password: hash});

        return res.status(201).json({status: 201, message: "success", createdUser});
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


// login route
router.post('/login', async (req, res) => {
    try {
        // find the user
        const foundUser = await db.User.findOne({email : req.body.email});

        // send error if user is null
        if(foundUser === null) {
            return res.status(404).json({
                status: 404,
                message: "That user doesn't exist yet. Please register first."});
        }

        // handle invalid login attempt
        if(!foundUser) {
            return res.sendStatus(500).json({message: 'The username or password is incorrect.'});
        }

        // compare password from form with password in db
        const match = await bcrypt.compare(req.body.password, foundUser.password);

        // handle invalid login attempt, or authenticate user
        if(!match) {
            return res.sendStatus(500).json({message: 'The username or password is incorrect.'});
        } else {
            // create signed jwt token
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


module.exports = router;