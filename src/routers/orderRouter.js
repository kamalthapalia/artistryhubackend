const express = require('express');
const router = express.Router();
const db = require('../models');
const {validateToken, validateArtist} = require('../middlewares/AuthMiddleware');
const jwt = require("jsonwebtoken");
const orders = db.orders;

// router.get('/', validateToken, async (req, res) => {
//         try {
//             const allOrders = await orders.findAll();
//             res.json(allOrders);
//         } catch (err) {
//             res.status(400).send({error: err.message});
//         }
//     }
// );

// //get my all orders
// router.get('/my/', validateToken, async (req, res) => {
//         try {
//             const token = req.headers['authorization'];
//             if (!token || !token.startsWith('Bearer ')) {
//                 return res.status(401).send('Unauthorized');
//             }
//             const cleanedToken = token.substring(7);
//             const decodedToken = jwt.verify(cleanedToken, "hehe");
//             const id = decodedToken.id;
//             const allOrders = await orders.findAll({where: {user_id: id}});
//             res.json(allOrders);
//         } catch (err) {
//             res.status(400).send({error: err.message});
//         }
//     }
// );


// get all my orders with order items and artworks and artist in formatted way like order_id, order_date, order_items: [{artwork_id, artwork_name, artist_id, artist_name, price}]
router.get('/my', validateToken, async (req, res) => {
    try {
        const token = req.headers['authorization'];
        if (!token || !token.startsWith('Bearer ')) {
            return res.status(401).send('Unauthorized');
        }
        const cleanedToken = token.substring(7);
        const decodedToken = jwt.verify(cleanedToken, "hehe");
        const id = decodedToken.id;
        const allOrders = await orders.findAll({where: {user_id: id}});
        const formattedOrders = [];
        for (const order of allOrders) {
            const orderItems = await db.orderitems.findAll({where: {order_id: order.id}});
            const formattedOrderItems = [];
            for (const orderItem of orderItems) {
                const artwork = await db.artworks.findOne({where: {id: orderItem.artwork_id}});
                const artist = await db.users.findOne({where: {id: artwork.artist}});
                formattedOrderItems.push({
                    artwork_id: artwork.id,
                    artist_id: artist.id,
                    price: artwork.price
                });
            }
            formattedOrders.push({
                order_id: order.id,
                order_date: order.createdAt,
                order_items: formattedOrderItems
            });
        }
        res.json(formattedOrders);
    } catch (err) {
        res.status(400).send({error: err.message});
    }
});


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
            const order = {user_id: id, ...req.body};
            const newOrder = await orders.create(order);
            res.json(newOrder);
        } catch (err) {
            res.status(400).send({error: err.message});
        }
    }
);
module.exports = router;