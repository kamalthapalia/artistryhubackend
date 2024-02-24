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

        const existingArtworkIds = orderItemArtworkIds.map(orderItem => orderItem.artwork_id);

        const allArtworks = await artworks.findAll({
            where: {
                id: {[Sequelize.Op.notIn]: existingArtworkIds}
            },
            order: [['createdAt', 'DESC']] // Order by createdAt attribute in descending order
        });

        res.json(allArtworks);
    } catch (error) {
        // Handle errors if any
        console.error(error);
        res.status(500).json({error: 'Internal Server Error' + error.message});
    }
});


const getOrderItemArtworkIds = async () => {
    const orderItemArtworkIds = await orderitems.findAll({
        attributes: ['artwork_id']
    });

    return orderItemArtworkIds.map(orderItem => orderItem.artwork_id);
};

//return artworks on price range
router.get('/price/:min/:max', async (req, res) => {
    try {
        const min = req.params.min;
        const max = req.params.max;

        // Fetch IDs of artworks that are already in orderitems table
        const existingArtworkIds = await getOrderItemArtworkIds();

        const artworks = await db.artworks.findAll({
            where: {
                id: {
                    [Op.notIn]: existingArtworkIds
                },
                price: {
                    [Op.between]: [min, max]
                }
            },
            order: [['createdAt', 'DESC']]
        });

        res.json(artworks);
    } catch (err) {
        res.status(400).send({error: err.message, code: 400});
    }
});

// Return artworks based on search title, excluding those already in orderitems table
router.get('/search/:title', async (req, res) => {
    try {
        const title = req.params.title;

        // Fetch IDs of artworks that are already in orderitems table
        const existingArtworkIds = await getOrderItemArtworkIds();

        const artworks = await db.artworks.findAll({
            where: {
                id: {
                    [Op.notIn]: existingArtworkIds
                },
                title: {
                    [Op.like]: `%${title}%`
                }
            }
        });

        res.json(artworks);
    } catch (err) {
        res.status(400).send({error: err.message});
    }
});

// Return artworks based on category ID, excluding those already in orderitems table
router.get('/category/:id', async (req, res) => {
    try {
        const categoryId = req.params.id;

        // Fetch IDs of artworks that are already in orderitems table
        const existingArtworkIds = await getOrderItemArtworkIds();

        const artworks = await db.artworks.findAll({
            where: {
                id: {
                    [Op.notIn]: existingArtworkIds
                },
                category: categoryId
            }
        });

        res.json(artworks);
    } catch (err) {
        res.status(400).send({error: err.message, code: 400});
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
            //delete the file too
            const artwork = await artworks.findOne({where: {id: id}});
            const filePath = path.join(__dirname, 'uploads', artwork.image);
            fs.unlinkSync(filePath);

            res.json({message: "Artwork deleted"});
        } catch (err) {
            res.status(400).send({error: "Artwork not found"});
        }
    }
);


router.get('/user/:id', async (req, res) => {
    try {
        const artworks = await db.artworks.findAll({
            where: {artist: req.params.id},
            order: [['createdAt', 'DESC']] // Order by createdAt attribute in descending order
        });

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

//return artworks by category
