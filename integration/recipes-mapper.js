module.exports = {

    mapArray: function (array) {
        if (!array){
            return [];
        }else {
            return Array.from(array);
        }
    },

    mapDtoToRecipe: function (recipe){
        return {
            title: recipe.title,
            ingredients: generateIngredients(recipe),
            weekday: recipe.weekday,
            image: recipe.image,
            alt: recipe.alt
        }
    }


}

let generateIngredients = function(recipe){
    let ingredients = [];
    for (let ingredient of recipe.ingredients){
        let mappedIngredient = {
            name: ingredient.ingredientName,
            quantity: ingredient.ingredientQty,
            measurement: ingredient.ingredientWeight,
            purchased: ingredient.purchased,
        }
        ingredients.push(mappedIngredient);
    }
    return ingredients;
}