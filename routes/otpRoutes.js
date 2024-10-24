const express = require("express");
const { generateOtp, verifyOtp } = require("../middlewares/otpMiddleware");

const router = express.Router();

router.get("/verify-otp", (req, res) => {
  const email = req.query.email; // Get parameters from query
  console.log(email);
  const username = req.query.username; // Get parameters from query
  console.log(username);
  const password = req.query.password; // Get parameters from query
  console.log(password);
  res.render("verifyOtp", { email, username, password }); // Pass them to the view
});
router.post("/generate-otp", generateOtp);
router.post("/verify-otp", verifyOtp);

module.exports = router;
