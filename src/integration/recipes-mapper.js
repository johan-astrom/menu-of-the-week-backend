module.exports = {

    mapRecipeArray: function (array) {
        if (!array){
            return [];
        }else{
        let newArray = []
        for (let entry of array){
            newArray.push(this.mapRecipeToDto(entry));
        }
        return newArray;
        }
    },

    mapIngredientArray: function (array) {
        if (!array){
            return [];
        }else {
            return Array.of(array)
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
    },

    mapRecipeToDto: function (recipe){
        return{
            id: recipe.id,
            title: recipe.title,
            ingredients: generateDtoIngredients(recipe),
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

let generateDtoIngredients = function(recipe){
    let ingredients = [];

    for (let ingredient of recipe.ingredients){
        let mappedIngredient = {
            ingredientName: ingredient.name,
            ingredientQty: ingredient.quantity,
            ingredientWeight: ingredient.measurement,
            purchased: ingredient.purchased,
        }
        ingredients.push(mappedIngredient);
    }
    return ingredients;
}