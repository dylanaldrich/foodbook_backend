/* imports */
const express = require('express');
const router = express.Router();
const db = require('../models');

/* Foodbooks routes */

// foodbook create
router.post('/', async (req, res) => {
    try {
        // find the current user in order to push the created foodbook into their foodbooks array
        const currentUser = await db.User.findById(req.userId)

        // create the foodbook
        const createdFoodbook = await db.Foodbook.create(req.body);

        // give foodbook's user prop the value of currentUser
        createdFoodbook.user = currentUser;
        createdFoodbook.save();

        // push the new foodbook into currentUser's foodbooks array
        currentUser.foodbooks.push(createdFoodbook);
        currentUser.save();

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

        // verify that the current user is the owner of the foodbook
        if(foundFoodbook.user._id === req.userId){
            res.status(200).json({foodbook: foundFoodbook});
        }
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

        // verify that the current user is the owner of the foodbook
        if(foundFoodbook.user._id === req.userId){
            res.status(200).json({updatedFoodbook: updatedFoodbook});
        }
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
        const deletedFoodbook = await db.Foodbook.findById(req.params.foodbookId)
        .populate('Recipes')
        .populate('User')
        .exec();
        
        // extra failsafe to handle if foodbook doesn't exist
        if(!deletedFoodbook) return res.status(200).json({message: "Sorry, that foodbook doesn't exist in our database. Please try again."}); 
        
        // verify that the current user is the owner of the foodbook
        if(deletedFoodbook.user._id === req.userId) {
            // remove foodbook reference from user
            const foodbookUser = deletedFoodbook.user;
            await foodbookUser.foodbooks.remove(deletedFoodbook);
            foodbookUser.save();

            // remove foodbook reference(s) from associated recipes
            if(deletedFoodbook.recipes.length) {
                for(recipe in deletedFoodbook.recipes) {
                    // if a recipe is only saved to one foodbook, delete the recipe entirely
                    if (recipe.foodbooks.length = 1) {
                        db.Recipe.findByIdAndDelete(recipe._id);
                    } else {
                        // TODO ask instructor if this is actually removing the foodbook association from the recipe document in the db (or if it needs to be done like above, by querying the db)
                        // otherwise, just remove deletedFoodbook from that recipe's foodbooks array, therefore the recipe can remain saved in other foodbooks
                        recipe.foodbooks.remove(deletedFoodbook);
                        recipe.save();
                    }
                }
            }

            // delete foodbook from db
            deletedFoodbook.deleteOne();

            res.sendStatus(200).json({deletedFoodbook: deletedFoodbook});
        }
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Something went wrong. Please try again.'
        });
    }
});


/* Exports */
module.exports = router;