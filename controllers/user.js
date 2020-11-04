/* imports */
const express = require('express');
const router = express.Router();
const db = require('../models');

/* User Routes */

// user show
router.get('/', async (req, res) => {
    try {
        // find the user, and their foodbooks and recipes
        const foundUser = await db.User.findById(req.userId);
        const userFoodbooks = await db.Foodbook.find({user: req.userId}).populate('recipes').exec();
        const userRecipes = await db.Recipe.find({user: req.userId});

        res.status(200).json({status: 200, data: foundUser, foodbooks: userFoodbooks, recipes: userRecipes });
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
        // find the user
        const updatedUser = await db.User.findById(req.userId);

        // extra failsafe to handle if user doesn't exist 
        if(!updatedUser) return res.status(200).json({message: "Sorry, that user doesn't exist in our database. Please try again."});

        // handle if update form was incomplete
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
        // find deleted user 
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