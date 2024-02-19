const express = require('express');
const router = express.Router();
const db = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {validateToken, validateArtist} = require('../middlewares/AuthMiddleware');
const {Op} = require('sequelize');
const users = db.users;
if (!users) {
    console.error("Error: 'users' model is not initialized or imported correctly.");
}


router.post('/register', async (req, res) => {
    try {
        var exists = await db.users.findOne({where: {email: req.body.email}});
        if (exists) {
            return res.status(400).send({code: 400, message: "User with this email already exists"});
        }
        const user = req.body;
        user.password = bcrypt.hashSync(user.password, 10);
        const resp = await db.users.create(user);
        if (resp) {
            const accessToken = jwt.sign({id: resp.id}, "hehe");
            res.status(200).send({
                code: 200,
                message: "User registered successfully",
                token: accessToken
            });
        } else {
            res.status(400).send({message: "Error: User not registered", code: 400});
        }
    } catch (err) {
        console.error("Error during user registration:", err);
        res.status(400).send("Error: " + err.message);
    }
});

router.post('/login', async (req, res) => {
    try {
        const user = await db.users.findOne({where: {email: req.body.email}});
        if (user) {
            const passwordValid = bcrypt.compareSync(req.body.password, user.password);
            if (passwordValid) {
                const accessToken = jwt.sign({id: user.id}, "hehe");
                res.json({
                    username: user.username,
                    id: user.id,
                    accessToken
                });
            } else {
                res.status(400).send({message: 'Invalid credentials', code: 400});
            }
        } else {
            res.status(400).send({message: 'Invalid credentials', code: 400});
        }
    } catch (err) {
        console.log(err)
    }
});

router.get('/auth', validateToken, async (req, res) => {
    try {
        const user = await db.users.findOne({where: {id: req.user.id}});
        if (user) {
            res.json(user);
        } else {
            res.status(400).send("User not found");
        }
    } catch (err) {
        res.json({error: err.message});
    }
});

router.get('/artists', async (req, res) => {
        try {
            const artists = await db.users.findAll({where: {role: 'artist'}});
            res.json(artists);
        } catch (err) {
            console.log(err)
        }

    }
);

router.get('/all', async (req, res) => {
    const users = await db.users.findAll();
    res.json(users);
});

router.get('/user/:id', async (req, res) => {
        try {


            const user = await db.users.findOne({where: {id: req.params.id}});
            if (user) {
                //exclude password
                user.password = undefined;
                res.json(user);
            } else {
                res.status(404).send("User not found");
            }
        } catch (err) {
            res.status(400).send({error: err.message});
        }
    }
);
router.get('/me', async (req, res) => {
    try {
        // Extract token from headers
        const token = req.headers['authorization'];

        // Check if token exists and has a bearer token
        if (!token || !token.startsWith('Bearer ')) {
            return res.status(401).send('Unauthorized');
        }


        // Extract and verify token
        const cleanedToken = token.substring(7);
        const decodedToken = jwt.verify(cleanedToken, "hehe");
        const id = decodedToken.id;

        // Fetch user information from the database
        const user = await db.users.findOne({where: {id: id}});

        if (user) {
            const basicUserInfo = {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,

            };
            res.json(basicUserInfo);
        } else {
            console.log(`User of id ${id} not found in the database`);
            res.status(404).send(`User with ID ${id} not found`);
        }
        // res.send(user);
    } catch (error) {
        console.error("Error retrieving user information:", error.message);
        if (error.name === 'JsonWebTokenError') {
            res.status(401).send('Invalid token');
        } else {
            res.status(500).send("Internal Server Error");
        }
    }
});


router.get('/search', async (req, res) => {
    const username = req.query.username;
    const users = await db.users.findAll({where: {username: {[Op.like]: '%' + username + '%'}}});
    res.json(users);
});

router.put('/update/', async (req, res) => {
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
        await db.users.update(req.body, {
            where: {id: id}
        });
        res.json(req.body);
    } catch (err) {
        res.status(400).send("Error: " + "User not found" + err.message);
    }
});

router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    await db.users.destroy({
        where: {id: id}
    });
    res.json('User with id ' + id + ' deleted');
});


module.exports = router;
