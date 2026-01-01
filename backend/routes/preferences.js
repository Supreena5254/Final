const express = require("express");
const pool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware"); // Changed from 'auth' to 'authMiddleware'

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  const {
    diet_type,
    allergies,
    cuisines,
    skill_level,
    meal_goal,
    health_goal,
  } = req.body;

  try {
    await pool.query(
      `
      INSERT INTO user_preferences
      (user_id, diet_type, allergies, cuisines, skill_level, meal_goal, health_goal)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      ON CONFLICT (user_id)
      DO UPDATE SET
        diet_type = EXCLUDED.diet_type,
        allergies = EXCLUDED.allergies,
        cuisines = EXCLUDED.cuisines,
        skill_level = EXCLUDED.skill_level,
        meal_goal = EXCLUDED.meal_goal,
        health_goal = EXCLUDED.health_goal,
        updated_at = NOW()
      `,
      [
        req.user.id,
        diet_type,
        allergies,
        cuisines,
        skill_level,
        meal_goal,
        health_goal,
      ]
    );

    console.log("✅ Preferences saved for user:", req.user.id);
    res.json({ message: "Preferences saved successfully" });
  } catch (err) {
    console.error("PREFERENCES ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;