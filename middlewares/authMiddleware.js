const jwt = require("jsonwebtoken");
const JWT_SECRET = "secret";
const User = require("../models/user");

const authMiddleWare = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "No token Provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    req.user = user;
    console.log("user in authmiddleware", req.user);
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid Token" });
  }
};

module.exports = authMiddleWare;
