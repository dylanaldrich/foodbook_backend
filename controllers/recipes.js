/* imports */
const express = require('express');
const router = express.Router();
const db = require('../models');

/* Recipes routes */

// recipe create
router.post('/', async (req, res) => {
    try {
        // create the recipe
        const createdRecipe = await db.Recipe.create(req.body);

        // find the current user in order to push the created recipe into their foodbook(s)
        const currentUser = await db.User.findById(req.userId)

        // for each of the current user's foodbooks that was checked on the new recipe form, set up the two-way connection between recipe and foodbook(s)
        for(foodbook of currentUser.foodbooks) {
            if(req.body['foodbook_' + foodbook._id] === 'on') {
                // push the foodbook into the recipe's foodbooks array
                await createdRecipe.foodbooks.push(foodbook);

                // push the new recipe into each foodbook's recipes array; save the foodbook
                await foodbook.recipes.push(createdRecipe);
                foodbook.save();
            }
        }
        // now that the new recipe has its foodbook(s) linked, save the recipe
        createdRecipe.save();

        res.status(201).json({recipe: createdRecipe});
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Something went wrong. Please try again.',
            error: error,
        });
    }
});


// recipe show -- NOTE I think this will be unnecessary, because I will write this into the search controller to fetch one recipe
// router.get('/:recipeId', async (req, res) => {
//     try {
//         const foundRecipe = await db.Recipe.findById(req.params.recipeId);

//         // verify that the current user is the owner of the recipe
//         if(foundRecipe.user._id === req.userId){
//             res.status(200).json({recipe: foundRecipe});
//         }
//     } catch (error) {
//         return res.status(500).json({
//             status: 500,
//             message: 'Something went wrong. Please try again.'
//         });
//     }
// });

// TODO - on the frontend, write in logic on recipe detail to determine if a recipe has been saved into a user's foodbook(s), and if so, display an edit button, or if not, display the ADD button (and on search results also, as a stretch goal)
// recipe update
router.put('/:recipeId', async (req, res) => {
    try {
        const updatedRecipe = await db.Recipe.findByIdAndUpdate(req.params.recipeId, req.body, {new: true});

        // extra failsafe to handle if user doesn't exist
        if(!updatedRecipe) return res.status(200).json({message: "Sorry, that recipe doesn't exist in our database. Please try again."}); 

        // verify that the current user is the owner of the recipe
        if(foundRecipe.user._id === req.userId){
            res.status(200).json({updatedRecipe: updatedRecipe});
        }
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Something went wrong. Please try again.'
        });
    }
});


// recipe delete
router.delete('/:recipeId', async (req, res) => {
    try {
        // find recipe to be deleted, populate its recipes
        const deletedRecipe = await db.Recipe.findById(req.params.recipeId)
            .populate({path: 'recipes'}).exec();

        // extra failsafe to handle if recipe doesn't exist
        if(!deletedRecipe) return res.status(200).json({message: "Sorry, that recipe doesn't exist in our database. Please try again."}); 

        // verify that the current user is the owner of the recipe
        if(foundRecipe.user._id === req.userId){
            // update/delete recipes stored the deleted recipe
            const recipesToRemove = deletedRecipe.recipes;
            for (recipe in recipesToRemove) {
                // if a recipe is only saved to one recipe, delete the recipe entirely
                if (recipe.recipes.length <= 1) {
                    recipe.deleteOne();
                } else {
                    // otherwise, just remove deletedRecipe from that recipe's recipes array, therefore the recipe can remain saved in other recipes
                    recipe.recipes.remove(deletedRecipe);
                    recipe.save();
                }
            }

            // delete user from db
            deletedRecipe.deleteOne();

            res.sendStatus(200).json({deletedRecipe: deletedRecipe});
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