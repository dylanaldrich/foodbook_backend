/* imports */
const express = require('express');
const router = express.Router();
const axios = require('axios');

/* EXTERNAL API ROUTES */
// Source: https://developer.edamam.com/

// search all recipes
router.get('/:query', async (req, res) => {
    try {
        // send query to Edamam API
        const searchResults = await axios.get('https://api.edamam.com/search', {
            params: {
                q: req.params.query,
                app_id: 'e5bc8cdc',
                app_key: '9d7dfee460130fbbc136b5851c16ea0b',
                from: 0,
                to: 100,
            }
        })
        .then((response) => {
            return response.data;
        });

        res.status(200).json({searchResults: searchResults});
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Sorry, that search didn't work. Please try again.",
            error: error,
        });
    }
});


// get one recipe
router.get('/show/:edamam_id', async (req, res) => {
    try {
        // send query to Edamam API with one URI id
        const foundRecipe = await axios.get('https://api.edamam.com/search', {
            params: {
                q: req.params.edamam_id,
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
            message: "Sorry, we couldn't retrieve that recipe. Please try again.",
            error: error,
        });
    }
});


module.exports = router;