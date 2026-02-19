const jwt = require("jsonwebtoken");

const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      req.user = null;
      return next();
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : authHeader;

    if (!token) {
      req.user = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      console.log("✅ Optional auth: User ID =", decoded.id);
    } catch (err) {
      req.user = null;
      console.log("⚠️ Optional auth: Invalid token");
    }

    next();
  } catch (err) {
    console.error("❌ Optional auth error:", err.message);
    req.user = null;
    next();
  }
};

module.exports = optionalAuth;