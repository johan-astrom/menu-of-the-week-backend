const db = require('../resource/db');
const bodyParser = require('body-parser');
const pgFormat = require('pg-format');

db.createDatabase();

module.exports = {

    getAllRecipes: async function () {
        let recipes = await getAll('recipes');
        let ingredients = await getAll('ingredients');
        for (let recipe of recipes
            ) {
            recipe.ingredients = ingredients.filter(ingredient => ingredient.recipe_id === recipe.id
            )
        }
        return recipes;
    },

    getAllIngredients: async function () {
        let ingredients = db.query('SELECT * FROM ingredients');
    },

    createRecipe: async function (recipe) {
        const client = await db.connect();

        try {
            await client.query('BEGIN');

            let data = {
                title: recipe.title,
                weekday: recipe.weekday,
                ingredients: recipe.ingredients
            };
            let recipeId = 0;

            let text = 'INSERT INTO recipes (title, weekday) VALUES ($1, $2) RETURNING id;';
            let params = [data.title, data.weekday];
            await client.query(text, params, (err, result) => {
                if (err) {
                    console.error('Error persisting recipe: ' + err.message);
                } else {
                    recipeId = result.rows[0].id;
                }

                text = ingredientQuery(data, recipeId);
                client.query(text, [], err => {
                    if (err) {
                        console.error('Error persisting ingredient: ' + err.message);
                    }
                });
            });

            await client.query('COMMIT');
            return data;
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }


}

let getAll = async function (table) {
    try {
        const res = await db.query(`SELECT * FROM ${table}`);
        return res.rows;
    } catch (err) {
        return err.message;
    }
}

function ingredientQuery(data, recipeId) {
    let params = [];
    for (let ingredient of data.ingredients) {
        params.push([
            ingredient.name,
            ingredient.quantity,
            ingredient.measurement,
            ingredient.purchased,
            recipeId
        ]);
    }
    let text = pgFormat("INSERT INTO ingredients (name, quantity, measurement, purchased, recipe_id) " +
        "VALUES %L;", params);
    return text;
}