const express = require('express');
const router = express.Router();
const db = require('../models');

// user show
router.get('/:userId', async (req, res) => {
    try {
        const foundUser = await db.User.findById(req.params.userId);
        res.status(200).json({status: 200, data: foundUser});
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Something went wrong. Please try again.'
        });
    }
});

// user edit -- Handled on the front end?

// user update
// router.put('/:userId', async (req, res) => {
//     try {
//         const updatedUser = await db.User.findByIdAndUpdate(req.params.userId, req.body, {new: true});

//         // extra failsafe to handle if user doesn't exist
//         if(!updatedUser) return res.status(200).json({message: "Sorry, that user doesn't exist in our database. Please try again."}); 

//         res.status(200).json({status: 200, data: updatedUser});
//     } catch (error) {
//         return res.status(500).json({
//             status: 500,
//             message: 'Something went wrong. Please try again.'
//         });
//     }
// });

router.put('/:userId', (req, res) => {
    db.User.findByIdAndUpdate(req.params.userId, req.body, {new: true}, (error, updatedUser) => {
        if (error) { 
            return res.status(500).json({
                status: 500,
                message: 'Something went wrong. Please try again.'
            })
        } else if (!updatedUser) {
            return res.status(200).json({message: "Sorry, that user doesn't exist in our database. Please try again."}); 
        }

        res.status(200).json({status: 200, data: updatedUser});
    });
});

// user delete

module.exports = router;