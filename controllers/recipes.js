/* imports */
const express = require('express');
const router = express.Router();
const db = require('../models');

/* Recipes routes */

// recipe show
router.get('/:recipeId', async (req, res) => {
    try {
        // find the recipe
        const foundRecipe = await db.Recipe.findById(req.params.recipeId);

        // failsafe error if not found
        if(!foundRecipe) {
            return res.status(404).status.json({
                status: 404,
                message: "This recipe couldn't be found in the database."
            });
        };

        res.status(200).json({
            status: 200,
            foundRecipe: foundRecipe,
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Something went wrong. Please try again.',
            error: error,
        });
    }
});


// recipe remove from one foodbook
router.post('/:recipeId/:foodbookId', async (req, res) => {
    try {
        // find the removed recipe
        const removedRecipe = await db.Recipe.findById(req.params.recipeId);

        // find the foodbook it was removed from
        const foodbookToUpdate = await db.Foodbook.findById(req.params.foodbookId);

        // remove recipe from foodbook
        foodbookToUpdate.recipes.remove(removedRecipe);
        await foodbookToUpdate.save();

        // remove foodbook from recipe 
        removedRecipe.foodbooks.remove(foodbookToUpdate);
        await removedRecipe.save();

        res.status(200).json({message: "Recipe removed succesfully."});
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Something went wrong. Please try again.',
            error: error,
        });
    }
});


// recipe create
router.post('/', async (req, res) => {
    try {
        // create the recipe
        const createdRecipe = await db.Recipe.create(req.body);

        // find the current user
        const currentUser = await db.User.findById(req.userId)

        // loop through checked foodbooks and create recipe/foodbook associations
        req.body.foodbooksIds.forEach(async (foodbook) => {
            try {
                const linkedFoodbook = await db.Foodbook.findById(foodbook);

                await createdRecipe.foodbooks.push(linkedFoodbook);

                await linkedFoodbook.recipes.push(createdRecipe);

                await linkedFoodbook.save();
            } catch (error) {
                return res.status(500).json({
                    status: 500,
                    message: 'Something went wrong. Please try again.',
                    error: error,
                });
            }
        });
        await createdRecipe.save();

        // add the user to the recipe
        createdRecipe.user = currentUser;
        await createdRecipe.save();

        // add the recipe to the user
        currentUser.recipes.push(createdRecipe);
        await currentUser.save();

        res.status(201).json({
            status: 201,
            recipe: createdRecipe,
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Something went wrong. Please try again.',
            error: error,
        });
    }
});


// recipe update
router.put('/:recipeId', async (req, res) => {
    try {
        // find current user
        const currentUser = await db.User.findById(req.userId);
        
        // find the recipe to be updated; populate its user and their foodbooks
        const updatedRecipe = await db.Recipe.findById(req.params.recipeId);

        // extra failsafe to handle if recipe doesn't exist in db
        if(!updatedRecipe) return res.status(200).json({message: "Sorry, that recipe doesn't exist in our database. Please try again."});

        // clear the recipe's foodbooks array
        updatedRecipe.foodbooks = [];

        // update recipe type
        updatedRecipe.recipe_type = req.body.recipe_type;

        // remove the recipe from current user's foodbooks
        for(foodbook of currentUser.foodbooks) {
            const foodbookForRemoval = await db.Foodbook.findById(foodbook);

            await foodbookForRemoval.recipes.remove(updatedRecipe);
            
            await foodbookForRemoval.save();
        }

        // add the recipe to the foodbooks checked in the form, save each
        for(foodbook of req.body.foodbooksIds) {
            const foodbookForAdd = await db.Foodbook.findById(foodbook);

            await foodbookForAdd.recipes.push(updatedRecipe);

            await foodbookForAdd.save();

            updatedRecipe.foodbooks.push(foodbookForAdd);
        }

        // save the recipe
        await updatedRecipe.save();

        res.status(200).json({
            status: 200,
            updatedRecipe: updatedRecipe,
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Something went wrong. Please try again.',
            error: error,
        });
    }
});


// recipe delete
router.delete('/:recipeId', async (req, res) => {
    try {
        // find recipe to be deleted
        const deletedRecipe = await db.Recipe.findById(req.params.recipeId);

        // extra failsafe to handle if recipe doesn't exist
        if(!deletedRecipe) return res.status(200).json({message: "Sorry, that recipe doesn't exist in our database. Please try again."}); 

        // update foodbooks where recipe is stored
        const foodbooksToUpdate = deletedRecipe.foodbooks;
        
        for (foodbook of foodbooksToUpdate) {
            // find each foodbook in the db
            const foodbookToUpdate = await db.Foodbook.findById(foodbook)
            
            // remove the reference to deletedRecipe; save foodbook
            foodbookToUpdate.recipes.remove(deletedRecipe);
            await foodbookToUpdate.save();
        }

        // remove deletedRecipe from its user
        const userToUpdate = await db.User.findById(deletedRecipe.user);
        userToUpdate.recipes.remove(deletedRecipe);

        // delete recipe from db
        deletedRecipe.deleteOne();

        res.status(200).json({
            message: "Delete successful",
            userToUpdate: userToUpdate,
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Something went wrong. Please try again.',
            error: error,
        });
    }
});


/* Exports */
module.exports = router;