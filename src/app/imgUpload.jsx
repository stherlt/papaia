document.addEventListener("DOMContentLoaded", () => {
  const uploadButton = document.getElementById("uploadButton");
  const fileInput = document.getElementById("fileInput");
  const output = document.getElementById("output");

  // Handle the file input change (triggered by selecting a file)
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const jsonData = JSON.parse(e.target.result);
      insertDetailsIntoHTML(jsonData); // Insert details after parsing
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

    if (jsonData?.options) {
      jsonData.options.forEach((option, index) => {
        const foodItem = document.createElement("div");
        foodItem.classList.add("food-item", "p-4", "bg-white", "shadow-md", "rounded-lg", "my-4");

        foodItem.innerHTML = `
          <div class="item-container">
            <div class="item">
              <h2 class="item-name">${option.title}</h2>
              <img src="${option.image}" alt="${option.title}" class="item-image">
              <p class="item-description">${option.description}</p>
              <ul class="list-disc pl-6 mt-2">
                <li><strong>Cuisine:</strong> ${option.cuisine}</li>
                <li><strong>Diets:</strong> ${option.diets}</li>
                <li><strong>Type of Meal:</strong> ${option.typeOfMeal}</li>
              </ul>
              <h3 class="text-xl font-semibold mt-4">Recipe:</h3>
              <ol class="list-decimal pl-6 space-y-2">
                ${option.recipe.map((step, index) => `<li key="${index}">${step}</li>`).join("")}
              </ol>
            </div>
          </div>
        `;
        foodItem.style.opacity = "0";  // Start hidden
        foodItem.style.transform = "translateY(200px)";  // Slightly off position
        output.appendChild(foodItem);
        
        // Trigger animation
        setTimeout(() => {
            foodItem.style.transition = "opacity 2s ease-out, transform 0.5s ease-out";
            foodItem.style.opacity = "1";
            foodItem.style.transform = "translateY(0)";
        }, 10);
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


// Include your CSS within the JSX
const style = `
  .item-container {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap; /* This allows wrapping if items exceed container width */
  width: 80%; /* Ensure it doesn't exceed the container's width */
}

/* Individual item */
.item {
  flex: 1 1 30%; /* Each item will take up 30% of the container width */
  text-align: center;
  background-color: #ffffffbf;
  padding: 10px;
  color: #37371F;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25); /* Optional: Add shadow */
  margin: 10px 0; /* Optional: Add margin between items */
  box-sizing: border-box; /* Ensure padding doesn't affect width */
}

/* Item name styling */
.item-name {
  font-size: 1.5em;
  margin-bottom: 10px;
}

/* Image styling */
.item-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin-bottom: 10px;
}

/* Description styling */
.item-description {
  font-size: 1em;

}
`;

// Create a style element and append it to the document's head
const styleElement = document.createElement('style');
styleElement.innerHTML = style;
document.head.appendChild(styleElement);
