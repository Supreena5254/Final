// backend/routes/grocery.js
const express = require("express");
const router = express.Router();
const groceryController = require("../controllers/groceryController");
const authMiddleware = require("../middleware/authMiddleware");

// All grocery routes require authentication
router.use(authMiddleware);

// Get user's grocery list
router.get("/", groceryController.getGroceryList);

// Add recipe ingredients to grocery list
router.post("/add-recipe/:recipeId", groceryController.addRecipeToGrocery);

// Toggle ingredient checked status
router.put("/toggle/:groceryItemId", groceryController.toggleIngredient);

// Delete a grocery list item (recipe)
router.delete("/:groceryItemId", groceryController.deleteGroceryItem);

// Clear entire grocery list
router.delete("/", groceryController.clearGroceryList);

module.exports = router;