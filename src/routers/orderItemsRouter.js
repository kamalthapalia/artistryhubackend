const express = require('express');

const router = express.Router();
const db = require('../models');
const {validateToken, validateArtist} = require('../middlewares/AuthMiddleware');
const orderitems = db.orderitems;
const artworks = db.artworks
;

router.get('/', validateToken, async (req, res) => {
    try {
        const allOrderItems = await orderitems.findAll();
        res.json(allOrderItems);
    } catch (err) {
        res.status(400).send({error: err.message});
    }
});

router.post('/add', validateToken, async (req, res) => {
    try {
        const newOrderItem = await orderitems.create(req.body);

        res.json(newOrderItem);
    } catch (err) {
        res.status(400).send({error: err.message});
    }
});

//get orderitems with orderid

router.get('/order/:id', validateToken, async (req, res) => {
        try {
            const orderItems = await orderitems.findAll({where: {order_id: req.params.id}});
            res.json(orderItems);
        } catch (err) {
            res.status(400).send({error: err.message});
        }
    }
);


module.exports = router;