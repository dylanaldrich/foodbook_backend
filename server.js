/* External imports */
const express = require('express');
const cors = require('cors');

/* Internal imports */
const routes = require('./routes');

/* Config */
const PORT = proc.env.PORT || 3001;
const app = express()

/* Middleware */
app.use(express.json());
app.use(cors());

// Auth routes
app.use('/auth', routes.auth);

// User routes
app.use('/user', routes.user);

// Foodbooks routes
app.use('/foodbooks', routes.foodbooks);

// Recipes routes
app.use('/recipes', routes.recipes);

/* Connection */
app.listen(PORT, () => console.log( `Server is running on port ${PORT}`));