const express = require('express');
const router = express.Router();
const db = require('../models');

// TODO once we know how to isolate userId, add in gatekeeping to foodbook show, update and delete to make sure that currentUser is the owner of the foodbook before handling the request

// foodbook create
router.post('/', async (req, res) => {
    try {
        // TODO find the current user in order to push the created foodbook into their foodbooks array
        //const currentUser = await db.User.findById()

        // create the foodbook
        const createdFoodbook = await db.Foodbook.create(req.body); // this might need to be req.body

        // give foodbook's user prop the value of currentUser
        // createdFoodbook.user = currentUser;
        createdFoodbook.save();

        // push the new foodbook into currentUser's foodbooks array
        // currentUser.foodbooks.push(createdFoodbook);
        // currentUser.save();

        res.status(201).json({foodbook: createdFoodbook});
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Something went wrong. Please try again.',
            error: error
        });
    }
});


// foodbook show
router.get('/:foodbookId', async (req, res) => {
    try {
        const foundFoodbook = await db.Foodbook.findById(req.params.foodbookId);
        
        res.status(200).json({foodbook: foundFoodbook});
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Something went wrong. Please try again.'
        });
    }
});

// foodbook update
router.put('/:foodbookId', async (req, res) => {
    try {
        const updatedFoodbook = await db.Foodbook.findByIdAndUpdate(req.params.foodbookId, req.body, {new: true});

        // extra failsafe to handle if user doesn't exist
        if(!updatedFoodbook) return res.status(200).json({message: "Sorry, that foodbook doesn't exist in our database. Please try again."}); 

        res.status(200).json({updatedFoodbook: updatedFoodbook});
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
        // find foodbook to be deleted, populate its recipes
        const deletedFoodbook = await db.Foodbook.findById(req.params.foodbookId)
            .populate({path: 'recipes'}).exec();

        // extra failsafe to handle if foodbook doesn't exist
        if(!deletedFoodbook) return res.status(200).json({message: "Sorry, that foodbook doesn't exist in our database. Please try again."}); 

        // remove saved recipes from the foodbook
        const recipesToRemove = deletedFoodbook.recipes;
        for (recipe in recipesToRemove) {
            // if a recipe is only saved to one foodbook, delete the recipe entirely
            if (recipe.foodbooks.length <= 1) {
                recipe.deleteOne();
            } else {
                // otherwise, just remove deletedFoodbook from that recipe's foodbooks array
                recipe.foodbooks.remove(deletedFoodbook);
                recipe.save();
            }
        }

        // delete user from db
        deletedFoodbook.deleteOne();

        res.sendStatus(200).json({deletedFoodbook: deletedFoodbook});
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Something went wrong. Please try again.'
        });
    }
});

module.exports = router;