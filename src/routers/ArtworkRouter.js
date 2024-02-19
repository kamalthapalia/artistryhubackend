const express = require('express');
const router = express.Router();
const db = require('../models');
const {validateToken, validateArtist} = require('../middlewares/AuthMiddleware');
const multer = require('multer');
const fs = require('fs');
const {orders, orderitems, artworks} = require('../models');
const path = require('path');
const jwt = require("jsonwebtoken");
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

// Define storage for uploaded images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, {recursive: true});
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        let productName = (Date.now().toString() + req.body.title) || 'default'; // Use a default name if productName is not provided
        productName = productName.replace(/\s+/g, '-').toLowerCase();
        const extension = path.extname(file.originalname);
        const filename = `${productName}${extension}`;
        cb(null, filename);
    }
});

// Create multer instance with the defined storage
const upload = multer({storage: storage});


router.post('/add', upload.single('image'), validateArtist, validateToken, async (req, res) => {
    try {
        const token = req.headers['authorization'];

        if (!token || !token.startsWith('Bearer ')) {
            return res.status(401).send('Unauthorized');
        }

        // Extract and verify token
        const cleanedToken = token.substring(7);
        const decodedToken = jwt.verify(cleanedToken, "hehe");
        const id = decodedToken.id;
        if (!req.file) {
            return res.status(400).json({error: 'No image uploaded'});
        }

        // Access uploaded image information from req.file
        const {filename} = req.file;

        // Assuming you want to save image information to database, you can access other form data from req.body
        const artwork = await artworks.create({
            ...req.body,
            artist: id,
            image: filename,
            sold: "not"
            // Save only the image title to the database
        });

        res.json(artwork);
    } catch (err) {
        res.status(400).send({
            error: "Something went wrong with image upload",
            message: err.message
        });
    }
});


router.get('/all', async (req, res) => {
    try {
        // Retrieve IDs of artworks that are already in orderitems table
        const orderItemArtworkIds = await orderitems.findAll({
            attributes: ['artwork_id']
        });

        // Extract artwork IDs from the result
        const existingArtworkIds = orderItemArtworkIds.map(orderItem => orderItem.artwork_id);

        // Find all artworks that are not sold and whose IDs are not in orderitems table
        const allArtworks = await artworks.findAll({
            where: {
                id: {[Sequelize.Op.notIn]: existingArtworkIds}
            }
        });

        res.json(allArtworks);
    } catch (error) {
        // Handle errors if any
        console.error(error);
        res.status(500).json({error: 'Internal Server Error' + error.message});
    }
});


// artwork bought by particular user


router.get('/bought/', validateToken, async (req, res) => {
    try {
        const token = req.headers['authorization'];

        if (!token || !token.startsWith('Bearer ')) {
            return res.status(401).send('Unauthorized');
        }

        // Extract and verify token
        const cleanedToken = token.substring(7);
        const decodedToken = jwt.verify(cleanedToken, "hehe");
        const userId = decodedToken.id; // Assuming user ID is in the token

        // Find orders associated with the specified user ID
        const orderss = await orders.findAll({
            where: {
                user_id: userId, // Use the extracted user ID
                status: 'done' // Assuming 'done' represents completed orders
            },
            include: [
                {
                    model: orderitems,
                    include: [
                        {
                            model: artworks // Assuming Artwork is the correct model
                        }
                    ]
                }
            ]
        });

        // Extract artworks from order items
        const artworks = orders.flatMap(order => order.OrderItems.map(item => item.Artwork));

        res.json(artworks);
    } catch (error) {
        console.error('Error:', error); // Log the error for debugging purposes
        res.status(500).json({error: 'Internal Server Error' + error.message}); // Send a generic error response
    }
});


router.get('/artwork/:id', async (req, res) => {
    try {
        const artwork = await artworks.findOne({where: {id: parseInt(req.params.id)}});
        if (artwork) {

            //dont return artwork if it exists in orderitems table
            const orderItem = await orderitems.findOne({where: {artwork_id: artwork.id}});
            if (orderItem) {
                return res.status(400).send({code: 400, message: "Artwork not found"});
            }

            res.json(artwork);
        } else {
            res.status(400).send({code: 400, message: "Artwork not found"});
        }
    } catch (err) {
        res.status(400).send({code: 400, message: err.message});
    }
});


router.put('/update/:id', validateArtist, validateToken, async (req, res) => {
        try {
            const id = req.params.id;
            await artworks.update(req.body, {
                where: {id: id}
            });
            res.json(req.body);
        } catch (err) {
            res.status(400).send({error: "Artwork not found"});
        }
    }
);

router.delete('/delete/:id', validateArtist, validateToken, async (req, res) => {
        try {
            const id = req.params.id;
            await artworks.destroy({
                where: {id: id}
            });
            res.json({message: "Artwork deleted"});
        } catch (err) {
            res.status(400).send({error: "Artwork not found"});
        }
    }
);


router.get('/search/:title', async (req, res) => {
        try {
            const title = req.params.title;
            const artworks = await db.artworks.findAll({where: {title: {[Op.like]: '%' + title + '%'}}});
            res.json(artworks);
        } catch (err) {
            res.status(400).send({error: err.message});
        }
    }
);

router.get('/user/:id', async (req, res) => {
    try {
        const artworks = await db.artworks.findAll({where: {artist: req.params.id}});
        const artworksWithoutOrderItems = [];

        for (const artwork of artworks) {
            const orderItem = await orderitems.findOne({where: {artwork_id: artwork.id}});
            if (!orderItem) {
                artworksWithoutOrderItems.push(artwork);
            }
        }

        res.json(artworksWithoutOrderItems);
    } catch (err) {
        res.status(400).send({error: err.message});
    }
});

router.get('/sold/me', async (req, res) => {
    try {
        const token = req.headers['authorization'];

        if (!token || !token.startsWith('Bearer ')) {
            return res.status(401).send('Unauthorized');
        }

        // Extract and verify token
        const cleanedToken = token.substring(7);
        const decodedToken = jwt.verify(cleanedToken, "hehe");
        const userId = decodedToken.id; // Assuming user ID is in the token

        const artworks = await db.artworks.findAll({where: {artist: userId}});
        const artworksWithOrderItems = [];

        for (const artwork of artworks) {
            const orderItem = await orderitems.findOne({where: {artwork_id: artwork.id}});
            if (orderItem) {
                artworksWithOrderItems.push(artwork);
            }
        }

        res.json(artworksWithOrderItems);
    } catch (err) {
        res.status(400).send({error: err.message});
    }
});
router.get('/bought/me', async (req, res) => {
    try {
        const token = req.headers['authorization'];

        if (!token || !token.startsWith('Bearer ')) {
            return res.status(401).send('Unauthorized');
        }

        // Extract and verify token
        const cleanedToken = token.substring(7);
        const decodedToken = jwt.verify(cleanedToken, "hehe");
        const userId = decodedToken.id; // Assuming user ID is in the token

        const orderss = await db.orders.findAll({where: {user_id: userId}});
        const orderItems = await db.orderitems.findAll({where: {order_id: {[Op.in]: orderss.map(order => order.id)}}});
        const artworks = await db.artworks.findAll({where: {id: {[Op.in]: orderItems.map(orderItem => orderItem.artwork_id)}}});

        res.json(artworks);
    } catch (err) {
        res.status(400).send({error: err.message});
    }
});

module.exports = router;