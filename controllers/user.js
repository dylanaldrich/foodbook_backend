const express = require('express');
const router = express.Router();
const db = require('../models');

// user show
router.get('/:userId', async (req, res) => {
    try {
        const foundUser = await db.User.findById(req.params.userId)
            .populate({
                path: 'Foodbooks',
                populate: {
                    path: 'Recipes'
                }
            });

        res.status(200).json({status: 200, data: foundUser});
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Something went wrong. Please try again.'
        });
    }
});

// user update
router.put('/:userId', async (req, res) => {
    try {
        const updatedUser = await db.User.findByIdAndUpdate(req.params.userId, req.body, {new: true});

        // extra failsafe to handle if user doesn't exist
        if(!updatedUser) return res.status(200).json({message: "Sorry, that user doesn't exist in our database. Please try again."}); 

        res.status(200).json({status: 200, data: updatedUser});
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Something went wrong. Please try again.'
        });
    }
});

// user delete
router.delete('/:userId', async (req, res) => {
    try {
        // find user to be deleted, populate their foodbooks
        const deletedUser = await db.User.findById(req.params.userId);

        // extra failsafe to handle if user doesn't exist
        if(!deletedUser) return res.status(200).json({message: "Sorry, that user doesn't exist in our database. Please try again."}); 

        // remove their foodbooks from db
        const foodbooksToDelete = deletedUser.foodbooks;
        for (foodbook in foodbooksToDelete) {
            db.Foodbook.findByIdAndDelete(foodbook._id);
        }

        // delete user from db
        deletedUser.deleteOne();

        res.sendStatus(200).json({status: 200, data: deletedUser});
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Something went wrong. Please try again.'
        });
    }
});

module.exports = router;