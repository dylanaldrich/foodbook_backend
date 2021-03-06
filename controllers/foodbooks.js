/* imports */
const express = require('express');
const router = express.Router();
const db = require('../models');

/* Foodbooks routes */

// foodbook create
router.post('/', async (req, res) => {
    try {
        // find the current user in order to push the created foodbook into their foodbooks array
        const currentUser = await db.User.findById(req.userId);

        // create the foodbook
        const createdFoodbook = await db.Foodbook.create(req.body);

        // give foodbook's user prop the value of currentUser
        createdFoodbook.user = currentUser;
        await createdFoodbook.save();

        // push the new foodbook into currentUser's foodbooks array
        await currentUser.foodbooks.push(createdFoodbook);
        await currentUser.save();

        res.status(201).json({
            status: 201});
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Something went wrong. Please try again.',
        });
    }
});


// foodbook show
router.get('/:foodbookId', async (req, res) => {
    try {
        // find the foodbook
        const foundFoodbook = await db.Foodbook.findById(req.params.foodbookId).populate('recipes').exec();

        // extra failsafe to handle if user doesn't exist
        if(!foundFoodbook) return res.status(200).json({message: "Sorry, that foodbook doesn't exist in our database. Please try again."});

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
        // find the foodbook and update it with form data
        const updatedFoodbook = await db.Foodbook.findByIdAndUpdate(req.params.foodbookId, req.body, {new: true});

        // extra failsafe to handle if user doesn't exist
        if(!updatedFoodbook) return res.status(200).json({message: "Sorry, that foodbook doesn't exist in our database. Please try again."}); 

        res.status(200).json({
            status: 200,
            updatedFoodbook: updatedFoodbook
        });
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
        // find foodbook to be deleted; populate its recipes and user
        const deletedFoodbook = await db.Foodbook.findById(req.params.foodbookId).populate('Recipe').exec();
        
        // extra failsafe to handle if foodbook doesn't exist
        if(!deletedFoodbook) return res.status(200).json({message: "Sorry, that foodbook doesn't exist in our database. Please try again."}); 
        
        // remove foodbook reference from user
        const foodbookUser = await db.User.findById(deletedFoodbook.user);
        foodbookUser.foodbooks.remove(deletedFoodbook); // might need await
        await foodbookUser.save();

        // remove foodbook reference(s) from associated recipes
        if(deletedFoodbook.recipes.length) {
            for(recipe of deletedFoodbook.recipes) {
                const foundRecipe = await db.Recipe.findById(recipe);
                // if a recipe is only saved to one foodbook, completely delete the recipe from db
                if (foundRecipe.foodbooks.length === 1) {
                    await foundRecipe.deleteOne();
                } else {
                    foundRecipe.foodbooks.remove(deletedFoodbook);
                    await foundRecipe.save();
                }
            }
        }

        // delete foodbook from db
        deletedFoodbook.deleteOne();

        res.status(200).json({message: "Delete successful"});
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Something went wrong. Please try again.'
        });
    }
});


/* Exports */
module.exports = router;