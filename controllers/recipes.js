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
        console.log("createdRecipe before save: ", createdRecipe);

        // find the current user in order to push the created recipe into their foodbook(s)
        // const currentUser = await db.User.findById(req.userId)
        /* FOR TESTING PURPOSES: */
        const currentUser = await db.User.findById(req.body.userId)
        /* END TEST */

        // for each of the current user's foodbooks that was checked on the new recipe form, set up the two-way connection between recipe and foodbook(s)
        // for(foodbook of currentUser.foodbooks) {
        //     if(req.body['foodbook_' + foodbook._id] === 'on') {
                // push the foodbook into the recipe's foodbooks array
                // await createdRecipe.foodbooks.push(foodbook);
                /* FOR TESTING PURPOSES: */
                req.body.foodbooks.forEach(async (foodbook) => { // pass in an array of foodbookIds in the request in insomnia
                    const linkedFoodbook = await db.Foodbook.findById(foodbook);
                    createdRecipe.foodbooks.push(linkedFoodbook);
                    linkedFoodbook.recipes.push(createdRecipe);
                    await linkedFoodbook.save();
                });
                /* END TEST */

                // push the new recipe into each foodbook's recipes array; save the foodbook
                // await foodbook.recipes.push(createdRecipe);
                // foodbook.save();
        //     }
        // }
        // add the user to the recipe
        createdRecipe.user = currentUser;
        createdRecipe.save();
        console.log("createdRecipe AFTER save: ", createdRecipe);

        // add the recipe to the user
        currentUser.recipes.push(createdRecipe);
        currentUser.save();

        res.status(201).json({
            recipe: createdRecipe,
            currentUser: currentUser, // <= for testing
        });
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
        // find current user
        // const currentUser = await db.User.findById(req.userId);
        /* TESTING: */
        const currentUser = await db.User.findById(req.body.userId);
        /* END TEST */

        // find the recipe to be updated; populate its user and their foodbooks
        const recipeToUpdate = await db.Recipe.findById(req.params.recipeId)
            .populate({
                path: 'User',
                populate: {
                    path: 'Foodbook',
                }
            })
            .exec();

        // verify that the current user is the owner of the recipe before handling update
        // if(recipeToUpdate.user === currentUser._id){ // uncomment for production
            // handle if recipe is added/removed from any foodbook(s)
            for(foodbook of currentUser.foodbooks) {
                // const checkedFoodbook = req.body['foodbook_' + foodbook._id] === 'on';
                // const isInFoodbook = recipeToUpdate.foodbooks.includes(foodbook._id);
                const checkedFoodbook = req.body.foodbooks; // FOR TESTING
                const isInFoodbook = recipeToUpdate.foodbooks.includes(checkedFoodbook);  // FOR TESTING
                console.log("isInFoodbook: ", isInFoodbook);
                const isAddedFoodbook = checkedFoodbook && !isInFoodbook;
                console.log("isAddedFoodbook: ", isAddedFoodbook);
                const isRemovedFoodbook = isInFoodbook && !checkedFoodbook;
                console.log("isRemovedFoodbook: ", isRemovedFoodbook);
                const foodbookToUpdate = await db.Foodbook.findById(foodbook._id);

                if(isAddedFoodbook) {
                    await recipeToUpdate.foodbooks.push(foodbook);
                    foodbookToUpdate.recipes.push(recipeToUpdate);
                    foodbookToUpdate.save();
                } 
                else if(isRemovedFoodbook) {
                    await recipeToUpdate.foodbooks.remove(foodbook);
                    foodbookToUpdate.recipes.remove(recipeToUpdate);
                    foodbookToUpdate.save();
                }
            }
            await recipeToUpdate.save();

            const updatedRecipe = await db.Recipe.findByIdAndUpdate(req.params.recipeId, req.body, {new: true});

            // extra failsafe to handle if recipe doesn't exist
            if(!updatedRecipe) return res.status(200).json({message: "Sorry, that recipe doesn't exist in our database. Please try again."}); 

            res.status(200).json({
                updatedRecipe: updatedRecipe,
            });
        // }
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
        // find recipe to be deleted, populate its foodbooks, user
        const deletedRecipe = await db.Recipe.findById(req.params.recipeId);
        console.log("deletedRecipe: ", deletedRecipe);
        // extra failsafe to handle if recipe doesn't exist
        if(!deletedRecipe) return res.status(200).json({message: "Sorry, that recipe doesn't exist in our database. Please try again."}); 

        // verify that the current user is the owner of the recipe
        // if(deletedRecipe.user === req.userId){ //uncomment for production
            // update foodbooks where recipe is stored
            const foodbooksToUpdate = deletedRecipe.foodbooks;
            console.log("foodbooksToUpdate: ", foodbooksToUpdate);
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
        // } uncomment for production
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
        const removedRecipe = await db.Recipe.findById(req.params.recipeId);
        const foodbookToUpdate = await db.Foodbook.findById(req.params.foodbookId);

        foodbookToUpdate.recipes.remove(removedRecipe);
        await foodbookToUpdate.save();

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


/* Exports */
module.exports = router;