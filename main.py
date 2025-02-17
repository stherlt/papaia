import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import json
import requests
from google import genai
from google.genai import types
import PIL.Image
from pydantic import BaseModel

# Load environment variables
load_dotenv()

# Configuration
GEM_API = os.getenv('GEMINI_KEY')
SPOON_API = os.getenv('SPOONACULAR_KEY')
NGROK_PATH = os.getenv('NGROK_URL')

# Prompt for Gemini API
PROMPT = """
Analyze the provided image of a food dish and provide your top 3 guesses (with confidence scores from 0 to 1) as well as the likely cuisine (e.g., Italian, Mexican, Indian, etc.). Present results clearly and concisely, each guess should be the main dish and not include ingredients in the title. ie. an image of belgian waffles should not have a guess of "waffles with strawberries" but should say "Belgian Waffles" to have atleast some specificity.

Use this JSON Schema:
Guesses = [{'guess': str, 'confidence': float, 'cuisine': str},{'guess': str, 'confidence': float, 'cuisine': str},{'guess': str, 'confidence': float, 'cuisine': str}]
Return: Guesses.json
"""

# Pydantic model for Gemini API response
class Guesses(BaseModel):
    guess: str
    confidence: float
    cuisine: str

# Initialize Flask app
app = Flask(__name__)

# Enable CORS to allow cross-origin requests from your frontend
CORS(app)

# Folder where images are stored
UPLOAD_FOLDER = os.path.expanduser("~/Documents/received_images")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Set Flask's upload folder
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Function to analyze image using Gemini API
def analyze_image(image_path):
    try:
        # Open the image
        image = PIL.Image.open(image_path)
        
        # Initialize Gemini client
        client = genai.Client(api_key=f'{GEM_API}')

        # Send image and prompt to Gemini API
        response = client.models.generate_content(
            model="gemini-2.0-pro-exp-02-05",
            contents=[PROMPT, image],
            config={
                'response_mime_type': 'application/json',
                'response_schema': list[Guesses],
            })

        # Parse the response
        print("Gemini API raw response:", response.text)
        guesses = json.loads(response.text)
        return guesses
    except Exception as e:
        print(f"Error analyzing image: {str(e)}")
        raise e

# Function to fetch recipes from Spoonacular API
def get_recipe_choices(food_name):
    """
    Get summary of the three recipes
    """
    url = f"https://api.spoonacular.com/recipes/complexSearch?query={food_name}&instructionsRequired=true&addRecipeInformation=true&fillIngredients=true&sort=popularity&sortDirection=desc&number=3&apiKey={SPOON_API}"
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
            amount = f"{ingredient['amount']} {ingredient['unit']}"
            info = {
                'name': name,
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

# Function to process all guesses and fetch recipes
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

# Route to handle image upload
@app.route('/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image part in request"}), 400

    image = request.files['image']
    if image.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        # Print the file name to verify the image name
        print(f"Uploading image: {image.filename}")
        save_path = os.path.join(UPLOAD_FOLDER, image.filename)
        image.save(save_path)
        
        # Debug: Check if the file is saved
        if os.path.exists(save_path):
            print(f"Image saved at: {save_path}")
        else:
            print(f"Error: Image not saved at {save_path}")
            return jsonify({"error": "Image could not be saved"}), 500
        
        # Analyze the image using Gemini API
        print("Analyzing image with Gemini API...")
        guesses = analyze_image(save_path)
        print("Gemini API response:", guesses)
        
        # Get recipes for each guess
        print("Fetching recipes from Spoonacular API...")
        all_recipes = give_all(guesses)
        print("Recipes fetched:", all_recipes)
        
        # Return the JSON response
        return jsonify(all_recipes)
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

# Route to serve uploaded images
@app.route('/images/<filename>')
def serve_image(filename):
    """Serves an image from the upload folder"""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Run the Flask app
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)