const express = require('express')
const router = express.Router();
const db = require('../models');
const reviews = db.reviews
const {validateToken, validateArtist} = require('../middlewares/AuthMiddleware');
const jwt = require("jsonwebtoken");

//get reviews by /post/:id
router.get('/post/:id', async (req, res) => {
    try {
        const review = await reviews.findAll({
            where: {artwork_id: req.params.id},
            order: [['createdAt', 'DESC']] // Assuming there's a createdAt field in your reviews table
        });
        res.json(review);
    } catch (err) {
        res.status(400).send({error: err.message, code: 400});
    }
});


//add review
router.post('/add', validateToken, async (req, res) => {
    try {
        const token = req.headers['authorization'];

        if (!token || !token.startsWith('Bearer ')) {
            return res.status(401).send('Unauthorized');
        }

        const cleanedToken = token.substring(7);
        const decodedToken = jwt.verify(cleanedToken, "hehe");
        const userId = decodedToken.id;
        const rev = {
            artwork_id: req.body.artwork_id,
            review: req.body.review,
            user_id: userId
        };


        const newReview = await reviews.create(rev);
        res.json(newReview);
    } catch (err) {
        res.status(400).send({error: err.message, code: 400});
    }
});
module.exports = router;


