const mapper = require('./recipes-mapper');
const recipesRepository = require('./recipes-repository');

module.exports = {

    getAllRecipes: async function () {
        return mapper.mapArray(await recipesRepository.getAllRecipes());
    }
}