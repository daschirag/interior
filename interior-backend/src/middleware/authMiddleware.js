const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
      { algorithms: ["HS256"] }
    );
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Invalid token",
    });
  }

  // The account must still exist: a deleted user's token stops working immediately.
  // If the database can't be reached, fail closed rather than letting the request through.
  let user;
  try {
    user = await User.findById(decoded.id);
  } catch (error) {
    console.error("auth: user lookup failed:", error.message);
    return res.status(503).json({
      success: false,
      message: "Service temporarily unavailable. Please try again.",
    });
  }

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Account no longer exists. Please sign in again.",
    });
  }

  req.user = decoded;
  next();
};

module.exports = authenticateToken;
