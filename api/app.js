const app = require('express')();
const bodyParser = require('body-parser');
const db = require('../resource/db');
const pgFormat = require('pg-format');
const cors = require('cors');
const service = require('../integration/recipes-service');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`server running on port: ${port}`));

db.createDatabase();

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
        res.status(200).json(response);
    } catch (err) {
        res.status(400).json({
            'error': err.message
        })
    }
});

app.put('/recipes/:id', async (req, res) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        let recipe = req.body;
        let recipeId = req.params.id;

        let text = 'UPDATE recipes SET title=$1, weekday=$2 WHERE id=$3;'
        let params = [recipe.title, recipe.weekday, recipeId];
        await client.query(text, params);

        await client.query('DELETE FROM ingredients WHERE recipe_id=$1;', [recipeId]);

        text = ingredientQuery(recipe, recipeId);
        await client.query(text);

        await client.query('COMMIT');

        res.json({
            'message': 'success',
            'recipe': recipe,
        });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(400).json({
            'error': err.stack
        })
    } finally {
        client.release();
    }
});

app.delete('/recipes/:id', async (req, res) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        let recipeId = req.params.id;

        let text = 'DELETE FROM recipes WHERE id=$1';
        let params = [recipeId];
        await client.query(text, params);

        text = 'DELETE FROM ingredients WHERE recipe_id=$1';
        params = [recipeId];
        await client.query(text, params);

        await client.query('COMMIT');

        res.status(200).json({
            'message': 'success'
        })
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(200).json({
            'error': err.stack
        })
    } finally {
        client.release();
    }
})



