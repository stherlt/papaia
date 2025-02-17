document.addEventListener("DOMContentLoaded", () => {
  const uploadButton = document.getElementById("uploadButton");
  const fileInput = document.getElementById("fileInput");
  const output = document.getElementById("output");

  // Handle the file input change (triggered by selecting a file)
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        insertDetailsIntoHTML(jsonData); // Insert details after parsing
      } catch (err) {
        output.innerHTML = "<p>There was an error parsing the JSON file.</p>";
      }
    };

    reader.readAsText(file);
  };

  // Handle clicking the button to prompt the file input
  uploadButton.addEventListener("click", () => {
    fileInput.click(); // Trigger file input on button click
  });

  // Handle file input change
  fileInput.addEventListener("change", handleFileUpload);

  const insertDetailsIntoHTML = (jsonData) => {
    output.innerHTML = ""; // Clear any previous content

    if (Array.isArray(jsonData) && jsonData.length > 1) {
      // Extract the first array (guesses) and the second array (recipes)
      const guesses = jsonData[0];
      const recipesData = jsonData[1];

      // Insert guess details
      guesses.forEach((item) => {
        const foodItem = document.createElement("div");
        foodItem.classList.add("food-item", "p-4", "bg-white", "shadow-md", "rounded-lg", "my-4");

        if (item.guess) {
          foodItem.innerHTML = `
            <div class="item-container">
              <div class="item">
                <h2 class="item-name">${item.guess}</h2>
                <p class="item-cuisine">Cuisine: ${item.cusine}</p>
                <p class="item-confidence">Confidence: ${item.confidence * 100}%</p>
              </div>
            </div>
          `;
        }

        output.appendChild(foodItem);
      });

      // Insert recipes details
      recipesData.forEach((recipeObj) => {
        recipeObj.recipes.forEach((recipe) => {
          const foodItem = document.createElement("div");
          foodItem.classList.add("food-item", "p-4", "bg-white", "shadow-md", "rounded-lg", "my-4");

          const recipeItem = document.createElement("div");
          recipeItem.classList.add("recipe-item", "p-4", "bg-white", "shadow-md", "rounded-lg", "my-4");

          recipeItem.innerHTML = `
            <div class="recipe-container">
              <div class="recipe">
                <h3 class="recipe-title">${recipe.title}</h3>
                <img src="${recipe.image}" alt="${recipe.title}" class="recipe-image">
                <p><strong>Cook Time:</strong> ${recipe.cook_time} minutes</p>
                <p><strong>Servings:</strong> ${recipe.servings}</p>
                <p><strong>Diets:</strong> ${recipe.diets.join(", ")}</p>
                
                <h4 class="text-xl font-semibold mt-4">Ingredients:</h4>
                <ul class="list-disc pl-6 mt-2">
                  ${recipe.ingredients.map(ingredient => `<li>${ingredient.name}: ${ingredient.amount}</li>`).join('')}
                </ul>

                <h4 class="text-xl font-semibold mt-4">Instructions:</h4>
                <ol class="list-decimal pl-6 space-y-2">
                  ${recipe.instructions.map(step => `<li>${step.step}</li>`).join('')}
                </ol>
              </div>
            </div>
          `;
          foodItem.appendChild(recipeItem);
          output.appendChild(foodItem);

          // Trigger animation
          setTimeout(() => {
            foodItem.style.transition = "opacity 2s ease-out, transform 0.5s ease-out";
            foodItem.style.opacity = "1";
            foodItem.style.transform = "translateY(0)";
          }, 10);
        });
      });
    } else {
      output.innerHTML = "<p>No valid data found in the JSON file.</p>";
    }

    // Scroll to the new content after appending
    setTimeout(() => {
      output.lastChild.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100); // Delay to ensure content is rendered before scrolling
  };
});
