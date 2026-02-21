// backend/routes/ratings.js
const express = require("express");
const router = express.Router();
const ratingController = require("../controllers/ratingController");
const authMiddleware = require("../middleware/authMiddleware");
const optionalAuth = require("../middleware/optionalAuth"); // ✅ ADD THIS

// ============================================
// RATING ROUTES
// ============================================

// Get all ratings for a recipe
// ✅ FIX: Use optionalAuth so logged-in users get their own rating back too
// GET /api/ratings/:recipeId
router.get("/:recipeId", optionalAuth, ratingController.getRecipeRatings);

// Add or update rating (requires authentication)
// POST /api/ratings/:recipeId
// Body: { rating: 1-5, comment: "optional" }
router.post("/:recipeId", authMiddleware, ratingController.addOrUpdateRating);

// Delete rating (requires authentication)
// DELETE /api/ratings/:recipeId
router.delete("/:recipeId", authMiddleware, ratingController.deleteRating);

module.exports = router;