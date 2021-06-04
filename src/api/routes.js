const service = require('../integration/recipes-service');
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({extended: false}));
router.use(bodyParser.json());

router.get('/recipes', async (req, res) => {
    try {
        let recipes = await service.getAllRecipes();
        res.json({
            'message': 'success',
            'recipes': recipes
        });
    } catch (err) {
        res.status(400).json({
            'error': err.message
        })
    }
});

router.get('/ingredients', async (req, res) => {
    try {
        let ingredients = await service.getAllIngredients();
        res.json({
            'message': 'success',
            'ingredients': ingredients
        });
    } catch (err) {
        res.status(400).json({
            'error': err.message
        })
    }
});

router.post('/recipes', async (req, res) => {
    try {
        let response = await service.createRecipe(req.body);
        res.status(200).json({
            'message': 'success',
            'recipe': response
        });
    } catch (err) {
        res.status(400).json({
            'error': err.message
        })
    }
});

router.put('/recipes/:id', async (req, res) => {
    try {
        let response = await service.updateRecipe(req.body, req.params.id);
        res.status(200).json({
            'message': 'success',
            'recipe': response,
            'id': req.params.id
        })
    } catch (err) {
        res.status(400).json({
            'error': err.message
        })
    }
});

router.delete('/recipes/:id', async (req, res) => {
    try {
        await service.deleteRecipe(req.params.id);
        res.status(200).json({
            'message': 'success'
        })
    } catch (err) {
        res.status(400).json({
            'error': err.message
        })
    }
})

module.exports = router;



