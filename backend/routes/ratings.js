// backend/routes/ratings.js
const express = require("express");
const router = express.Router();
const ratingController = require("../controllers/ratingController");
const authMiddleware = require("../middleware/authMiddleware");

// ============================================
// RATING ROUTES
// ============================================

// Get all ratings for a recipe (public - no auth required)
// GET /api/ratings/:recipeId
router.get("/:recipeId", ratingController.getRecipeRatings);

// Add or update rating (requires authentication)
// POST /api/ratings/:recipeId
// Body: { rating: 1-5, reviewText: "optional" }
router.post("/:recipeId", authMiddleware, ratingController.addOrUpdateRating);

// Delete rating (requires authentication)
// DELETE /api/ratings/:recipeId
router.delete("/:recipeId", authMiddleware, ratingController.deleteRating);

module.exports = router;