const express = require('express');
const router = express.Router();
const db = require('../models');

// user show
router.get('/:userId', async (req, res) => {
    try {
        const foundUser = await db.User.findById(req.userId); // might need to change this to req.params.userId
        res.status(200).json({status: 200, data: foundUser});
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Something went wrong. Please try again.'
        });
    }
});

// user edit


// user update


// user delete

module.exports = router;