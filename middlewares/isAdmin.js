const jwt = require("jsonwebtoken");
const User = require("../models/user");

async function isAdmin(req, res, next) {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "No token Provided" });
    }

    const decoded = jwt.verify(token, "secret");
    const user = await User.findById(decoded.userId);
    req.user = user;

    if (user && user.role === "admin") {
      next();
    } else {
      return res.status(403).json({ message: "Access denied: Admins Only" });
    }
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

module.exports = isAdmin;
