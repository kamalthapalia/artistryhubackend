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


//get single order details with orderitems in formatted way
router.get('/:id', validateToken, async (req, res) => {
    try {
        const orderId = req.params.id;
        const token = req.headers['authorization'];

        if (!token || !token.startsWith('Bearer ')) {
            return res.status(401).send('Unauthorized');
        }

        const cleanedToken = token.substring(7);
        const decodedToken = jwt.verify(cleanedToken, "hehe");
        const userId = decodedToken.id;

        const order = await orders.findOne({where: {id: orderId, user_id: userId}});

        if (!order) {
            return res.status(404).send({error: "Order not found or does not belong to the requester"});
        }

        const orderItems = await db.orderitems.findAll({where: {order_id: order.id}});
        const formattedOrderItems = [];

        for (const orderItem of orderItems) {
            const artwork = await db.artworks.findOne({where: {id: orderItem.artwork_id}});
            const artist = await db.users.findOne({where: {id: artwork.artist}});
            formattedOrderItems.push({
                order_item_id: orderItem.id, // Add order item ID
                artwork_id: artwork.id,
                artist_id: artist.id,
                price: artwork.price
            });
        }

        res.json({
            order_id: order.id,
            order_date: order.createdAt,
            order_items: formattedOrderItems,
            total: order.total,
            user_id: order.user_id,
        });
    } catch (err) {
        res.status(400).send({error: err.message});
    }
});


//get first items of each of my orders in formatted way like order_id, order_date, artwork_id, artist_id, price just give a single array and not nested array
router.get('/my/first', validateToken, async (req, res) => {
    try {
        const token = req.headers['authorization'];
        if (!token || !token.startsWith('Bearer ')) {
            return res.status(401).send('Unauthorized');
        }
        const cleanedToken = token.substring(7);
        const decodedToken = jwt.verify(cleanedToken, "hehe");
        const userId = decodedToken.id;

        // Fetch all orders for the user
        const allOrders = await orders.findAll({where: {user_id: userId}});
        const formattedOrders = [];

        for (const order of allOrders) {
            // Fetch all order items associated with the order
            const orderItems = await db.orderitems.findAll({where: {order_id: order.id}});

            // If there are no order items, skip this order
            if (orderItems.length === 0) {
                continue;
            }

            // Fetch artwork and artist details for the first order item
            const artwork = await db.artworks.findOne({where: {id: orderItems[0].artwork_id}});
            const artist = await db.users.findOne({where: {id: artwork.artist}});

            // Push order details along with order item length
            formattedOrders.push({
                order_id: order.id,
                order_date: order.createdAt,
                artwork_id: artwork.id,
                artist_id: artist.id,
                price: artwork.price,
                total: order.total,
                address: order.address,
                order_items_length: orderItems.length // Add the length of order items
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


//cancel order route that deletes all order items and order
router.delete('/cancel/:id', validateToken, async (req, res) => {
    try {
        const orderId = req.params.id;
        const token = req.headers['authorization'];

        if (!token || !token.startsWith('Bearer ')) {
            return res.status(401).send('Unauthorized');
        }

        const cleanedToken = token.substring(7);
        const decodedToken = jwt.verify(cleanedToken, "hehe");
        const userId = decodedToken.id;

        const order = await orders.findOne({where: {id: orderId, user_id: userId}});

        if (!order) {
            return res.status(404).send({error: "Order not found or does not belong to the requester"});
        }

        const orderItems = await db.orderitems.findAll({where: {order_id: order.id}});

        for (const orderItem of orderItems) {
            await db.orderitems.destroy({where: {id: orderItem.id}});
        }

        await orders.destroy({where: {id: order.id}});
        res.json({message: "Order cancelled successfully"});
    } catch (err) {
        res.status(400).send({error: err.message});
    }
});


//route for this http://localhost:8080/orders/orderitem/${order?.id}`
router.delete('/orderitem/:id', validateToken, async (req, res) => {
        try {
            const orderItemId = req.params.id;
            const token = req.headers['authorization'];

            if (!token || !token.startsWith('Bearer ')) {
                return res.status(401).send('Unauthorized');
            }

            const cleanedToken = token.substring(7);
            const decodedToken = jwt.verify(cleanedToken, "hehe");
            const userId = decodedToken.id;

            const orderItem = await db.orderitems.findOne({where: {id: orderItemId}});
            const order = await orders.findOne({where: {id: orderItem.order_id, user_id: userId}});

            if (!order) {
                return res.status(404).send({error: "Order not found or does not belong to the requester"});
            }

            await db.orderitems.destroy({where: {id: orderItemId}});
            res.json({message: "Order item removed successfully"});
        } catch (err) {
            res.status(400).send({error: err.message});
        }
    }
);


module.exports = router;