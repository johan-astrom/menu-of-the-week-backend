const app = require('express')();
const db = require('./db');
const bodyParser = require('body-parser');

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

app.post('/recipes', (req, res) => {
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
        console.log(data.ingredients)
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

//todo endast senaste ingrediensen committas.
            for (let ingredient of data.ingredients) {
                let text = "INSERT INTO ingredients (name, amount, measurement, recipeId) " +
                    "VALUES ($1, $2, $3, $4)";
                let params = [
                    ingredient.name,
                    ingredient.amount,
                    ingredient.measurement,
                    recipeId
                ];
                console.log(params);
                db.query(text, params, (err, result) => {
                    if (err) {
                        console.error('Error persisting ingredients: ' + err.message);
                    }
                });
            }
            db.query('COMMIT', err => {
                if (err) {
                    console.error('Error committing transaction: ' + err.message);
                }
            });
        });
    });
});
