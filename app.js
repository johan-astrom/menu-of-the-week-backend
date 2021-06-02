const app = require('express')();
const db = require('./db');
const bodyParser = require('body-parser');
const pgFormat = require('pg-format');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`server running on port: ${port}`));

db.createDatabase();

app.get('/recipes', (req, res) => {
    db.query('SELECT * FROM recipes JOIN ingredients ON recipes.id = ingredients.recipeId;', [], (err, result) => {
        if (err) {
            res.status(400).json({
                'error': err.message
            });
        } else {
            res.json({
                'message': 'success',
                'recipes': result.rows
            });
        }
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
                console.log('RecipeId inside first query: ' + recipeId);
                res.json({
                    'message': 'success',
                    'recipe': data,
                    'id': recipeId
                });
            }


        params = [];
        for (let ingredient of data.ingredients) {
            params.push([
                ingredient.name,
                ingredient.amount,
                ingredient.measurement,
                recipeId
            ]);
        }
        text = pgFormat("INSERT INTO ingredients (name, amount, measurement, recipeId) " +
            "VALUES %L;", params);
        client.query(text, [], err => {
            if (err){
                console.error('Error persisting ingredient: ' + err.message);
            }
        });
        });

        await client.query('COMMIT');
    } catch (err){
        await client.query('ROLLBACK');
    } finally{
        client.release();
    }
/*
    db.query('BEGIN', (err, result) => {
        if (err) {
            res.status(400).json({
                'error': err.message
            });
        }
        let data = {
            title: req.body.title,
            weekday: req.body.weekday,
            ingredients: req.body.ingredients
        };
        console.log('data: ' + JSON.stringify(data));
        let recipeId = 0;

        let text = 'INSERT INTO recipes (title, weekday) VALUES ($1, $2) RETURNING id;';
        let params = [data.title, data.weekday];
        db.query(text, params, (err, result) => {
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

            params = [];
            for (let ingredient of data.ingredients) {
                params.push([
                    ingredient.name,
                    ingredient.amount,
                    ingredient.measurement,
                    recipeId
                ]);
            }
            text = pgFormat("INSERT INTO ingredients (name, amount, measurement, recipeId) " +
                "VALUES %L;", params);
            console.log(text)
            db.query(text, [], err => {
                if (err){
                    console.error('Error persisting ingredient: ' + err.message);
                }
            });

            db.query('COMMIT', err => {
                if (err) {
                    console.error('Error committing transaction: ' + err.message);
                } else {
                    console.log('Commit successful - recipe persisted!')
                }
            });
        });
    });*/
});
