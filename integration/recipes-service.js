const mapper = require('./recipes-mapper');
const recipesRepository = require('./recipes-repository');

module.exports = {

    getAllRecipes: async function () {
        try{
            return mapper.mapArray(await recipesRepository.getAllRecipes());
        }catch (err){
            throw err
        }
    },

    getAllIngredients: async function (){
        try{
            return mapper.mapArray(await recipesRepository.getAllIngredients());
        }catch (err){
            throw err
        }
    }
}