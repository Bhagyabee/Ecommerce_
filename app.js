const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const fs = require("fs");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/user");
const { urlencoded } = require("body-parser");
const otpRoutes = require("./routes/otpRoutes");
const Product = require("./models/product");
const authMiddleWare = require("./middlewares/authMiddleware");
// const insertProduct = require("./controllers/insertProduct");
const cartRoutes = require("./routes/cartRoutes");
const adminRoutes = require("./routes/adminRoutes");
const orderRoutes = require("./routes/order");
const methodOverride = require("method-override");

// Middleware to override methods

app.use(cookieParser());

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(methodOverride("_method"));

const attachUser = (req, res, next) => {
  if (req.cookies.token) {
    try {
      const jwt = require("jsonwebtoken");
      const decoded = jwt.verify(req.cookies.token, "your-secret-key");
      req.user = decoded; // Attach user data to req
    } catch (error) {
      req.user = null; // No valid user token
    }
  }
  next(); // Proceed to next middleware or route handler
};

app.use(attachUser);

app.get("/", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 5;
  const skip = (page - 1) * limit;
  try {
    const products = await Product.find().skip(skip).limit(limit);
    res.render("home", { products, req });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Error fetching products");
  }
});
app.use("/uploads", express.static("uploads"));

app.use("/api/otp", otpRoutes);
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", authMiddleWare, cartRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/orders", orderRoutes);

mongoose
  .connect(
    "mongodb+srv://bhagyabeeb:kGY8jqQwQBsa6d37@cluster0.dmxjz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => {
    console.log("Successfully connected to DB");

    // Only start the server if DB connection is successful
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((error) => {
    console.error("Error connecting to DB:", error);
  });
