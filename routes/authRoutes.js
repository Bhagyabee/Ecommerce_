const express = require("express");
const router = express.Router();
const {
  signUp,
  RenderSignUp,
  RenderLogin,
  login,
  logout,
  RenderHome,
  RenderHomePage,

  RenderWelcome,
  RenderProfile,
} = require("../controllers/authController");

const authMiddleWare = require("../middlewares/authMiddleware");

router.get("/signUp", RenderSignUp);
router.get("/", RenderWelcome);
router.get("/profile", authMiddleWare, RenderProfile);

router.get("/login", RenderLogin);
router.get("/loadMoreProduct", authMiddleWare, RenderHome);
router.get("/home", authMiddleWare, RenderHomePage);

router.get("/logout", authMiddleWare, logout);

router.post("/signUp", signUp);
router.post("/login", login);
module.exports = router;
