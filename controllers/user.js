const express = require('express');
const router = express.Router();
const db = require('../models');

// user show
router.get('/', async (req, res) => {
    try {
        const foundUser = await db.User.findById(req.userId);

        const userFoodbooks = await db.Foodbook.find({user: req.userId}).populate('recipes').exec();
        console.log("userFoodbooks", userFoodbooks);
        // NOTE If I have trouble accessing user's foodbooks and their nested recipes on user show page, write in two other db queries here and then pass the data along with the response:

        res.status(200).json({status: 200, data: foundUser, foodbooks: userFoodbooks });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Something went wrong. Please try again.'
        });
    }
});

// user update
router.put('/', async (req, res) => {
    try {
        const updatedUser = await db.User.findById(req.userId);

        // extra failsafe to handle if user doesn't exist 
        if(!updatedUser) return res.status(200).json({message: "Sorry, that user doesn't exist in our database. Please try again."});
        if(!req.body.email || !req.body.username) return res.status(406).json({message: "Sorry, the form is incomplete. Please try again."});
        
        // update username and email
        updatedUser.username = req.body.username;
        updatedUser.email = req.body.email;

        // save the user
        await updatedUser.save();

        res.status(200).json({status: 200, data: updatedUser});
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Something went wrong. Please try again.'
        });
    }
});

// user delete
router.delete('/', async (req, res) => {
    try {
        // find user to be deleted, populate their foodbooks
        const deletedUser = await db.User.findById(req.userId);

        // extra failsafe to handle if user doesn't exist
        if(!deletedUser) return res.status(200).json({message: "Sorry, that user doesn't exist in our database. Please try again."}); 

        // remove their foodbooks from db
        const foodbooksToDelete = deletedUser.foodbooks;
        for (foodbook in foodbooksToDelete) {
            db.Foodbook.findByIdAndDelete(foodbook._id);
        }

        // delete user from db
        deletedUser.deleteOne();

        res.sendStatus(200).json({message: 'User deleted successfully.'});
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Something went wrong. Please try again.'
        });
    }
});

module.exports = router;