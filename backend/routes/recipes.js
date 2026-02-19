const express = require("express");
const router = express.Router();
const recipeController = require("../controllers/recipeController");
const authMiddleware = require("../middleware/authMiddleware");
const optionalAuth = require("../middleware/optionalAuth");  // ← ADD THIS

// Get recommended recipes (requires auth)
router.get("/recommended", authMiddleware, recipeController.getRecommendedRecipes);

// Get user favorites (requires auth)
router.get("/user/favorites", authMiddleware, recipeController.getFavorites);

// Ingredient search (optional auth)
router.get("/search/ingredients", optionalAuth, recipeController.getRecipes);  // ← CHANGED

// Get all recipes (optional auth)
router.get("/", optionalAuth, recipeController.getAllRecipes);  // ← CHANGED

// Get recipe by ID (optional auth) - MUST HAVE CORRECT is_favorite
router.get("/:id", optionalAuth, recipeController.getRecipeById);  // ← CHANGED

// Toggle favorite (requires auth)
router.post("/:recipeId/favorite", authMiddleware, recipeController.toggleFavorite);

// Delete favorite (requires auth)
router.delete("/:recipeId/favorite", authMiddleware, recipeController.deleteFavorite);

module.exports = router;