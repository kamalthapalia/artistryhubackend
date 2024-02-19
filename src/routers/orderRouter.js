const express = require('express');
const router = express.Router();
const db = require('../models');
const {validateToken, validateArtist} = require('../middlewares/AuthMiddleware');
const jwt = require("jsonwebtoken");
const orders = db.orders;

router.get('/', validateToken, async (req, res) => {
        try {
            const allOrders = await orders.findAll();
            res.json(allOrders);
        } catch (err) {
            res.status(400).send({error: err.message});
        }
    }
);

//get my all orders
router.get('/my/', validateToken, async (req, res) => {
        try {
            const token = req.headers['authorization'];
            if (!token || !token.startsWith('Bearer ')) {
                return res.status(401).send('Unauthorized');
            }
            const cleanedToken = token.substring(7);
            const decodedToken = jwt.verify(cleanedToken, "hehe");
            const id = decodedToken.id;
            const allOrders = await orders.findAll({where: {user_id: id}});
            res.json(allOrders);
        } catch (err) {
            res.status(400).send({error: err.message});
        }
    }
);


router.post('/add', validateToken, async (req, res) => {
        try {
            const token = req.headers['authorization'];

            // Check if token exists and has a bearer token
            if (!token || !token.startsWith('Bearer ')) {
                return res.status(401).send('Unauthorized');
            }

            // Extract and verify token
            const cleanedToken = token.substring(7);
            const decodedToken = jwt.verify(cleanedToken, "hehe");
            const id = decodedToken.id;
            const order = {user_id: id};
            const newOrder = await orders.create(order);
            res.json(newOrder);
        } catch (err) {
            res.status(400).send({error: err.message});
        }
    }
);
module.exports = router;