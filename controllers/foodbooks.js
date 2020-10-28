const express = require('express');
const router = express.Router();
const db = require('../models');


// foodbook show
router.get('/:foodbookId', async (req, res) => {
    try {
        const foundFoodbook = await db.Foodbook.findById(req.params.foodbookId);
        
        res.status(200).json({status: 200, data: foundFoodbook});
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Something went wrong. Please try again.'
        });
    }
});

// foodbook edit -- Handled on the front end?

// foodbook update
router.put('/:foodbookId', async (req, res) => {
    try {
        const updatedFoodbook = await db.Foodbook.findByIdAndUpdate(req.params.foodbookId, req.body, {new: true});

        // extra failsafe to handle if user doesn't exist
        if(!updatedFoodbook) return res.status(200).json({message: "Sorry, that foodbook doesn't exist in our database. Please try again."}); 

        res.status(200).json({status: 200, data: updatedFoodbook});
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Something went wrong. Please try again.'
        });
    }
});

// foodbook delete
router.delete('/:foodbookId', async (req, res) => {
    try {
        // find foodbook to be deleted, populate their foodbooks
        const deletedFoodbook = await db.Foodbook.findById(req.params.foodbookId)
            .populate({path: 'recipes'}).exec();

        // extra failsafe to handle if foodbook doesn't exist
        if(!deletedFoodbook) return res.status(200).json({message: "Sorry, that foodbook doesn't exist in our database. Please try again."}); 

        // remove saved recipes from the foodbook
        // TODO think through the logic to remove the deleted foodbook from each of its recipes' foodbooks array (need a loop) 
        const recipesToRemove = deletedFoodbook.recipes;
        for (recipe in recipesToRemove) {
            recipe.cate
        }

        // delete user from db
        deletedFoodbook.deleteOne();

        res.sendStatus(200).json({status: 200, data: deletedFoodbook});
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Something went wrong. Please try again.'
        });
    }
});

module.exports = router;