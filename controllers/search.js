const express = require('express');
const router = express.Router();
const axios = require('axios');

// search all recipes
router.get('/:query', async (req, res) => {
    try {
        const searchResults = await axios.get('https://api.edamam.com/search', {
            params: {
                q: req.params.query,
                app_id: 'e5bc8cdc',
                app_key: '9d7dfee460130fbbc136b5851c16ea0b',
                from: 0,
                to: 5,
            }
        })
        .then((response) => {
            return response.data;
        });

        res.status(200).json({searchResults: searchResults});
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Something went wrong. Please try again.',
            error: error,
        });
    }
});


// recipe detail
router.get('/show/:recipeUri', async (req, res) => {
    try {
        const foundRecipe = await axios.get('https://api.edamam.com/search', {
            params: {
                q: req.params.recipeUri,
                app_id: 'e5bc8cdc',
                app_key: '9d7dfee460130fbbc136b5851c16ea0b',
            }
        })
        .then((response) => {
            return response.data;
        });

        res.status(200).json({recipe: foundRecipe});
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Something went wrong. Please try again.',
            error: error,
        });
    }
});


module.exports = router;