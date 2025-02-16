import requests
from dotenv import load_dotenv
import os

load_dotenv()


API_KEY = os.getenv("API_KEY")

def get_recipe_choices(food_name):
    """
    Get summary of the three recipes
    """
    url = url = f"https://api.spoonacular.com/recipes/complexSearch?query={food_name}&instructionsRequired=true&addRecipeInformation=true&fillIngredients=true&sort=popularity&sortDirection=desc&number=3&apiKey={API_KEY}"
    response = requests.get(url)
    data = response.json()

    if "results" in data:
        if len(data["results"]) == 0:
            return
    
    results = []
    for recipe in data['results']:
        recipe_name = recipe.get('title', 'N/A')
        recipe_image  = recipe.get('image', 'N/A')
        cook_time = recipe.get('readyInMinutes', 'N/A')
        servings = recipe.get('servings', 'N/A')

        all_diet_types = ['vegetarian', 'vegan', 'glutenFree', 'dairyFree']
        diet = []
        for type in all_diet_types:
            if (recipe.get(type)):
                diet.append(type)

        extended_ingredients = recipe.get('extendedIngredients', [])
        ingredients = []
        for ingredient in extended_ingredients:
            name = ingredient['originalName']
            amount = f'{ingredient['amount']} {ingredient['unit']}'
            info = {
                'name': ingredient,
                'amount': amount
            }
            ingredients.append(info)
        
        full_instructions = (recipe.get('analyzedInstructions', []))[0]['steps']
        instructions = []
        for instruction in full_instructions:
            step_num = instruction['number']
            step_desc = instruction['step']
            step = {
                'number': step_num,
                'step': step_desc
            }
            instructions.append(step)

        json = {
            'title': recipe_name,
            'image': recipe_image,
            'cook_time': cook_time,
            'servings': servings,
            'diets': diet,
            'ingredients': ingredients,
            'instructions': instructions
        }
        results.append(json)

    return results

def give_all(json: list):
    all_recipes = []
    for guess in json:
        food_guess = guess['guess']
        three_recipes = get_recipe_choices(food_guess)

        result = {
            "guess": food_guess,
            "recipes": three_recipes
        }
        all_recipes.append(result)
    return all_recipes

example = [{"guess": "waffles"}]
print(give_all(example))




