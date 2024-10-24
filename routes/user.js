const express = require("express");
const router = express.Router();

const {
  changePassword,
  resetPassword,
  GetResetLink,
  seller,
  addAddress,
} = require("../controllers/userController");
const authMiddleWare = require("../middlewares/authMiddleware");

router.post("/changePassword", authMiddleWare, changePassword);
router.get("/forgotPassword", (req, res) => {
  res.render("forgotpassword");
});
router.post("/GetResetLink", GetResetLink);

router.post("/reset-password/:token", resetPassword);
router.get("/reset-password/:token", (req, res) => {
  const token = req.params.token;
  console.log(token);
  res.render("resetPassword", { token, req });
});
router.post("/seller", authMiddleWare, seller);
router.get("/address", authMiddleWare, (req, res) => {
  const user = req.user;

  res.render("address", { req, user });
});
router.post("/address", authMiddleWare, addAddress);

module.exports = router;
