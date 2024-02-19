const express = require('express')
const router = express.Router();
const db = require('../models');
const {validateToken, validateArtist} = require('../middlewares/AuthMiddleware');
const categories = db.categories


router.get('/', async (req, res) => {
        try {
            const allCategories = await categories.findAll();
            res.json(allCategories);
        } catch (err) {
            res.status(400).send({error: err.message});
        }
    }
);

router.post('/add', validateToken, validateArtist, async (req, res) => {
        try {

            //check if same category already exists case insensitive
            const exists = await categories.findOne({where: {name: req.body.name}});
            if (exists) {
                return res.status(400).send({code: 400, error: "Category already exists"});
            }

            const category = req.body;
            const newCategory = await categories.create(category);
            res.json(newCategory);
        } catch (err) {
            res.status(400).send({error: err.message});
        }
    }
);

router.put('/update/:id', validateToken, validateArtist, async (req, res) => {
        try {
            const id = req.params.id;
            await categories.update(req.body, {
                where: {id: id}
            });
            res.json(req.body);
        } catch (err) {
            res.status(400).send({error: "Category not found"});
        }
    }
);

router.delete('/delete/:id', validateToken, validateArtist, async (req, res) => {
        try {
            const id = req.params.id;
            await categories.destroy({
                where: {id: id}
            });
            res.json({message: "Category deleted"});
        } catch (err) {
            res.status(400).send({error: "Category not found"});
        }
    }
);
router.get('/:id', async (req, res) => {
    try {
        const category = await categories.findOne({where: {id: req.params.id}});
        if (category) {
            res.json(category);
        } else {
            res.status(404).send("Category not found");
        }
    } catch (err) {
        res.status(400).send({error: err.message});
    }
})


module.exports = router;