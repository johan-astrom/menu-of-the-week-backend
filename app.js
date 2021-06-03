const app = require('express')();
const db = require('./db');
const bodyParser = require('body-parser');
const pgFormat = require('pg-format');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`server running on port: ${port}`));

db.createDatabase();

app.get('/recipes', async (req, res) => {
    let recipes = await getAll('recipes');
    let ingredients = await getAll('ingredients');
    for (let recipe of recipes) {
        recipe.ingredients = ingredients.filter(ingredient => ingredient.recipe_id === recipe.id
        )
    }
    res.json({
        'message': 'success',
        'recipes': recipes
    });
});

app.get('/ingredients', (req, res) => {
    db.query('SELECT * FROM ingredients', [], (err, result) => {
        if (err) {
            res.status(400).json({
                'error': err.message
            });
        } else {
            res.json({
                'message': 'success',
                'ingredients': result.rows
            });
        }
    });
});

app.post('/recipes', async (req, res) => {
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        let data = {
            title: req.body.title,
            weekday: req.body.weekday,
            ingredients: req.body.ingredients
        };
        let recipeId = 0;

        let text = 'INSERT INTO recipes (title, weekday) VALUES ($1, $2) RETURNING id;';
        let params = [data.title, data.weekday];
        await client.query(text, params, (err, result) => {
            if (err) {
                console.error('Error persisting recipe: ' + err.message);
            } else {
                recipeId = result.rows[0].id;
                res.json({
                    'message': 'success',
                    'recipe': data,
                    'id': recipeId
                });
            }

            text = ingredientQuery(data, recipeId);
            client.query(text, [], err => {
                if (err) {
                    console.error('Error persisting ingredient: ' + err.message);
                }
            });
        });

        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
    } finally {
        client.release();
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
    }catch (err){
        await client.query('ROLLBACK');
        res.status(400).json({
            'error': err.stack
        })
    }finally{
        client.release();
    }
});


async function getAll(table) {
    try {
        const res = await db.query(`SELECT * FROM ${table}`);
        return res.rows;
    } catch (err) {
        return err.message;
    }
};

function ingredientQuery(data, recipeId) {
    let params = [];
    for (let ingredient of data.ingredients) {
        params.push([
            ingredient.ingredientName,
            ingredient.ingredientQty,
            ingredient.ingredientWeight,
            ingredient.purchased,
            recipeId
        ]);
    }
    let text = pgFormat("INSERT INTO ingredients (name, quantity, measurement, purchased, recipe_id) " +
        "VALUES %L;", params);
    return text;
}
