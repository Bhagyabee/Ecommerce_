const User = require("../models/user");
const bcrypt = require("bcrypt");
const Product = require("../models/product");
const jwt = require("jsonwebtoken");

const { getProducts } = require("./productController");

const JWT_SECRET = "secret";

const RenderWelcome = (req, res) => {
  res.render("Welcome");
};
const RenderSignUp = async (req, res) => {
  res.render("signUp");
};
const RenderProfile = async (req, res) => {
  console.log(req.user);
  const user = await User.findById(req.user._id).populate("address");
  res.render("profile", { req, user });
};
const RenderHome = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 5;
  const skip = (page - 1) * limit;

  try {
    const products = await Product.find().skip(skip).limit(limit);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Error in loading products" });
  }
};
const RenderHomePage = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 5;
  const skip = (page - 1) * limit;

  try {
    const products = await Product.find().skip(skip).limit(limit);
    res.render("home", { products, req });
  } catch (err) {
    res.status(500).json({ message: "Error in loading products" });
  }
};

const RenderLogin = async (req, res) => {
  res.render("login", { user: req.user });
};

const signUp = async (req, res) => {
  console.log(req.body);
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({
      message:
        " New password should contain at least 1 uppercase 1 lowercase and 1 number and at least 8 characters long",
    });
  }

  try {
    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(400).json({ message: " user already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("token", token, { httpOnly: true, secure: true });
    res.redirect("/api/auth/login");
  } catch (error) {
    console.log("Error in registering a new User");
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  console.log(req.body);
  console.log("login function");

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "User not found !" });
    }

    //check passwords

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials . Password and email does not match .",
      });
    }

    //send token to client
    req.user = user;
    console.log(user);
    const token = jwt.sign({ userId: user._id }, JWT_SECRET);
    res.cookie("token", token, { httpOnly: true, secure: true });
    res.status(200).json({ message: "Login Successful", token });
  } catch (error) {
    console.log("error in login");
    return res.status(500).json({ message: "Server error" });
  }
};

const logout = (req, res) => {
  res.clearCookie("token");
  console.log("Log out");
  res.redirect("/api/auth/");
};

module.exports = {
  RenderSignUp,
  RenderLogin,
  RenderWelcome,
  RenderProfile,
  RenderHome,
  RenderHomePage,

  signUp,
  login,
  logout,
};
