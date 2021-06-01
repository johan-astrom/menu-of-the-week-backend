const app = require('express')();
const db = require('./db');

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`server running on port: ${port}`));

app.get('/recipes', (req, res) => {
    db.query('SELECT * FROM recipes', [], (rows, err) => {
        if (err) {
            res.status(400).json({
                'error': err.message
            });
        } else {
            res.json({
                'message': 'success',
                'recipes': rows
            });
        }
    });
});

app.post('/recipes', (req, res) => {
    let data = {
        title: req.body.title,
        weekday: req.body.weekday
    }
    let text = 'INSERT INTO recipes VALUES ($1, $2);'
    let params = [data.title, data.weekday]
    db.query(text, params, (result, err) => {
        if (err){
            res.status(400).json({
                'error': err.message
            });
        }else{
            res.json({
                'message': 'success',
                'recipe': data,
                'id': this.lastId
            });
        }
    })
});




