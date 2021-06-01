const app = require('express')();
const db = require('./db');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`server running on port: ${port}`));

db.createDatabase();

app.get('/recipes', (req, res) => {
    db.query('SELECT * FROM recipes;', [], (err, result) => {
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
    let data = {
        title: req.body.title,
        weekday: req.body.weekday
    }
    let text = 'INSERT INTO recipes (title, weekday) VALUES ($1, $2) RETURNING id;'
    let params = [data.title, data.weekday]
    db.query(text, params, (err, result) => {
        if (err){
            res.status(400).json({
                'error': err.message
            });
        }else{
            res.json({
                'message': 'success',
                'recipe': data,
                'id': result.rows[0].id
            });
        }
    })
});




