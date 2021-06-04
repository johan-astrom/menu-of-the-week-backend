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


}

let getAll = async function(table) {
    try {
        const res = await db.query(`SELECT * FROM ${table}`);
        return res.rows;
    } catch (err) {
        return err.message;
    }
}