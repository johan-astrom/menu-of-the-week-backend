const mapper = require('./recipes-mapper');
const repository = require('./recipes-repository');

module.exports = {

    getAllRecipes: async function () {
        try {
            return mapper.mapRecipeArray(await repository.getAllRecipes());
        } catch (err) {
            throw err
        }
    },

    getAllIngredients: async function () {
        try {
            return mapper.mapIngredientArray(await repository.getAllIngredients());
        } catch (err) {
            throw err;
        }
    },

    createRecipe: async function (recipe) {
        try {
            return mapper.mapRecipeToDto(await repository.createRecipe(mapper.mapDtoToRecipe(recipe)));
        } catch (err) {
            throw err;
        }
    },

    updateRecipe: async function (recipe, id) {
        try {
            return mapper.mapRecipeToDto(await repository.updateRecipe(mapper.mapDtoToRecipe(recipe), id));
        } catch (err) {
            throw err;
        }
    },

    updateIngredientPurchased: async function (purchased, id){
        try{
            await repository.updateIngredientPurchased(purchased, id);
        }catch (err){
            throw err;
        }
    },

    removeWeekday: async function (id){
        try{
            await repository.removeWeekday(id);
        }catch (err){
            throw err;
        }
    },

    deleteRecipe: async function (id) {
        try {
            return repository.deleteRecipe(id);
        } catch (err) {
            throw err;
        }
    }

}