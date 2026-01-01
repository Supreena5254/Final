const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

router.get("/profile", authMiddleware, async (req, res) => {
    res.json({
        message: "Profile accessed",
        user: {
            id: req.user.id,
            email: req.user.email
        }
    });
});

module.exports = router;
