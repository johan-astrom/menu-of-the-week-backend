const {Pool} = require('pg');
const dotEnv = require('dotenv');

dotEnv.config();


const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

module.exports = {
    query: (text, params, callback) => {
        return pool.query(text, params, callback);
    },
    createDatabase: () => {
        pool.query("CREATE TABLE IF NOT EXISTS recipes (id SERIAL PRIMARY KEY, title TEXT, weekday VARCHAR(9))",
            [], err => {
                if (err) {
                    console.log(err)
                }
            });
        pool.query("CREATE TABLE IF NOT EXISTS ingredients " +
            "(id SERIAL PRIMARY KEY, name TEXT, amount SMALLINT, measurement TEXT, recipeId INT)",
            [], err => {
                if (err) {
                    console.log(err)
                }
            });
    }
}



