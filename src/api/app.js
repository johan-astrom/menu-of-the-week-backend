const app = require('express')();
const bodyParser = require('body-parser');
const cors = require('cors');
const service = require('../integration/recipes-service');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`server running on port: ${port}`));

app.get('/recipes', async (req, res) => {
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

app.get('/ingredients', async (req, res) => {
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

app.post('/recipes', async (req, res) => {
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

app.put('/recipes/:id', async (req, res) => {
    try {
        let response = await service.updateRecipe(req.body, req.params.id);
        res.status(200).json({
            'message': 'success',
            'recipe': response,
            'id': req.params.id
        })
    }catch (err){
        res.status(400).json({
            'error': err.message
        })
    }
});

app.delete('/recipes/:id', async (req, res) => {
    try{
        await service.deleteRecipe(req.params.id);
        res.status(200).json({
            'message': 'success'
        })
    }catch(err){
        res.status(400).json({
            'error': err.message
        })
    }
})



