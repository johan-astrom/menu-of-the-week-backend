const {Pool} = require('pg');

const pool = new Pool;

module.exports={
    query: (text, params, callback) => {
        return pool.query(text, params, callback);
    },
    createDatabase: () => {
        pool.query("CREATE DATABASE menu_of_the_week", [], err => console.log("DB menu_of_the_week found"));
        pool.query("CREATE TABLE IF NOT EXISTS recipes (id SERIAL PRIMARY KEY, title TEXT, weekday VARCHAR(9)",
            [], err => (console.log(err)));
        pool.query("CREATE TABLE IF NOT EXISTS ingredients " +
            "(id SERIAL PRIMARY KEY, name TEXT, amount SMALLINT, measurement TEXT",
            [], err => (console.log(err)))
    }
}



