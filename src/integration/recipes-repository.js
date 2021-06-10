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
        try{
            let result = await db.query('SELECT * FROM ingredients');
            return result.rows;
        }catch (err) {
            throw err;
        }
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
                    data.id = result.rows[0].id;
                }
                if (recipe.ingredients.length) {
                    text = ingredientQuery(data, data.id);
                    client.query(text, [], err => {
                        if (err) {
                            console.error('Error persisting ingredient: ' + err.message);
                        }
                    });
                }
            });

            await client.query('COMMIT');
            return data;
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    },

    updateRecipe: async function (recipe, id){
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            let text = 'UPDATE recipes SET title=$1, weekday=$2 WHERE id=$3;'
            let params = [recipe.title, recipe.weekday, id];
            await client.query(text, params);

            await client.query('DELETE FROM ingredients WHERE recipe_id=$1;', [id]);

            if (recipe.ingredients.length) {
                text = ingredientQuery(recipe, id);
                await client.query(text);
            }
            await client.query('COMMIT');

            return recipe;
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;

        } finally {
            client.release();
        }
    },

    updateIngredientPurchased: async function(purchased, id){
        let text = 'UPDATE ingredients SET purchased = $1 WHERE id = $2;';
        let params = [purchased, id];
        try{
            await db.query(text, params);
        }catch (err){
            throw err;
        }
    },

    removeWeekday: async function(id){
        let text = 'UPDATE recipes SET weekday = $1 WHERE id = $2;';
        let params = ['', id];
        try{
            await db.query(text, params);
        }catch (err){
            throw err;
        }
    },

    deleteRecipe: async function(id){
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            let text = 'DELETE FROM recipes WHERE id=$1';
            let params = [id];
            await client.query(text, params);

            text = 'DELETE FROM ingredients WHERE recipe_id=$1';
            params = [id];
            await client.query(text, params);

            await client.query('COMMIT');

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
        throw err;
    }
}

function ingredientQuery(data, recipeId) {
    let params = [];
    let text;
    for (let ingredient of data.ingredients) {
        let amount;
        if (ingredient.quantity){
            amount=ingredient.quantity;
            text = "INSERT INTO ingredients (name, quantity, purchased, recipe_id) VALUES %L;";
        }else{
            amount=ingredient.measurement;
            text = "INSERT INTO ingredients (name, measurement, purchased, recipe_id) VALUES %L;";
        }
        params.push([
            ingredient.name,
            amount,
            ingredient.purchased,
            recipeId
        ]);
    }
    let query = pgFormat(text, params);
    return query;
}