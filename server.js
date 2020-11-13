/* External imports */
const express = require('express');
const cors = require('cors');

/* Internal imports */
const controllers = require('./controllers');
const authRequired = require('./middleware/authRequired');

/* Config */
require('dotenv').config();
const PORT = process.env.PORT || 3001;
const app = express();

/* Middleware */
app.use(express.json());
app.use(cors({
    origin: "https://foodbook-recipeapp.herokuapp.com/",
}));

// Auth routes
app.use('/auth', controllers.auth);

// Search route
app.use('/search', controllers.search);

// User routes (auth required)
app.use('/user', authRequired, controllers.user);

// Foodbooks routes (auth required)
app.use('/foodbooks', authRequired, controllers.foodbooks);

// Recipes routes (auth required)
app.use('/recipe', authRequired, controllers.recipes);

/* Connection */
app.listen(PORT, () => console.log( `Server is running on port ${PORT}`));