const mapper = require('./recipes-mapper');
const recipesRepository = require('./recipes-repository');

module.exports = {

    getAllRecipes: async function () {
        try {
            return mapper.mapArray(await recipesRepository.getAllRecipes());
        } catch (err) {
            throw err
        }
    },

    getAllIngredients: async function () {
        try {
            return mapper.mapArray(await recipesRepository.getAllIngredients());
        } catch (err) {
            throw err;
        }
    },

    createRecipe: async function (recipe) {
        try {
            return mapper.mapRecipeToDto(await recipesRepository.createRecipe(mapper.mapDtoToRecipe(recipe)));
        } catch (err) {
            throw err;
        }
    },

    updateRecipe: async function (recipe, id) {
        try {
            return mapper.mapRecipeToDto(await recipesRepository.updateRecipe(mapper.mapDtoToRecipe(recipe), id))
        } catch (err) {
            throw err;
        }
    }

}