const pool = require("../config/db");

// ✅ FIXED: Proper rating calculation with weighted average
const addOrUpdateRating = async (req, res) => {
  const { recipeId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user.id;

  // Validate rating
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }

  try {
    // Check if user already rated this recipe
    const existingRating = await pool.query(
      "SELECT * FROM ratings WHERE recipe_id = $1 AND user_id = $2",
      [recipeId, userId]
    );

    let result;

    if (existingRating.rows.length > 0) {
      // Update existing rating
      result = await pool.query(
        `UPDATE ratings
         SET rating = $1, comment = $2, created_at = CURRENT_TIMESTAMP
         WHERE recipe_id = $3 AND user_id = $4
         RETURNING *`,
        [rating, comment, recipeId, userId]
      );
    } else {
      // Insert new rating
      result = await pool.query(
        `INSERT INTO ratings (recipe_id, user_id, rating, comment)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [recipeId, userId, rating, comment]
      );
    }

    // ✅ FIXED: Calculate proper weighted average rating
    await updateRecipeRating(recipeId);

    res.status(200).json({
      message: existingRating.rows.length > 0
        ? "Rating updated successfully"
        : "Rating added successfully",
      rating: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error adding/updating rating:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ NEW: Helper function to calculate and update recipe's average rating
const updateRecipeRating = async (recipeId) => {
  try {
    // Calculate average rating and total count from all user ratings
    const result = await pool.query(
      `SELECT
        ROUND(AVG(rating)::numeric, 1) as avg_rating,
        COUNT(*) as rating_count
       FROM ratings
       WHERE recipe_id = $1`,
      [recipeId]
    );

    const avgRating = result.rows[0].avg_rating || 0;
    const ratingCount = result.rows[0].rating_count || 0;

    // Update the recipe's rating in the recipes table
    await pool.query(
      `UPDATE recipes
       SET rating = $1,
           rating_count = $2
       WHERE recipe_id = $3`,
      [avgRating, ratingCount, recipeId]
    );

    console.log(`✅ Updated recipe ${recipeId}: Rating = ${avgRating} (${ratingCount} ratings)`);
  } catch (error) {
    console.error("❌ Error updating recipe rating:", error);
    throw error;
  }
};

// ✅ FIXED: Get all ratings for a recipe - uses users.id instead of users.user_id
const getRecipeRatings = async (req, res) => {
  const { recipeId } = req.params;

  try {
    // ✅ FIXED: Changed u.user_id to u.id
    const result = await pool.query(
      `SELECT
        r.rating_id,
        r.rating,
        r.comment,
        r.created_at,
        u.username,
        u.email
       FROM ratings r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.recipe_id = $1
       ORDER BY r.created_at DESC`,
      [recipeId]
    );

    // Get rating statistics
    const stats = await pool.query(
      `SELECT
        ROUND(AVG(rating)::numeric, 1) as average_rating,
        COUNT(*) as total_ratings,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
       FROM ratings
       WHERE recipe_id = $1`,
      [recipeId]
    );

    res.status(200).json({
      ratings: result.rows,
      statistics: stats.rows[0],
    });
  } catch (error) {
    console.error("❌ Error fetching ratings:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get user's rating for a specific recipe
const getUserRating = async (req, res) => {
  const { recipeId } = req.params;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT * FROM ratings
       WHERE recipe_id = $1 AND user_id = $2`,
      [recipeId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(200).json({ rating: null });
    }

    res.status(200).json({ rating: result.rows[0] });
  } catch (error) {
    console.error("❌ Error fetching user rating:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a rating
const deleteRating = async (req, res) => {
  const { recipeId } = req.params;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      "DELETE FROM ratings WHERE recipe_id = $1 AND user_id = $2 RETURNING *",
      [recipeId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Rating not found" });
    }

    // ✅ Recalculate recipe rating after deletion
    await updateRecipeRating(recipeId);

    res.status(200).json({ message: "Rating deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting rating:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get top rated recipes
const getTopRatedRecipes = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;

  try {
    const result = await pool.query(
      `SELECT
        r.*,
        COALESCE(r.rating, 0) as avg_rating,
        COALESCE(r.rating_count, 0) as total_ratings
       FROM recipes r
       WHERE r.rating_count > 0
       ORDER BY r.rating DESC, r.rating_count DESC
       LIMIT $1`,
      [limit]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching top rated recipes:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get rating distribution for a recipe
const getRatingDistribution = async (req, res) => {
  const { recipeId } = req.params;

  try {
    const result = await pool.query(
      `SELECT
        rating,
        COUNT(*) as count,
        ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER())::numeric, 1) as percentage
       FROM ratings
       WHERE recipe_id = $1
       GROUP BY rating
       ORDER BY rating DESC`,
      [recipeId]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching rating distribution:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  addOrUpdateRating,
  getRecipeRatings,
  getUserRating,
  deleteRating,
  getTopRatedRecipes,
  getRatingDistribution,
};