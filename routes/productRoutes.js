const express = require("express");
const path = require("path");
const fs = require("fs");

const router = express.Router();
const {
  getProducts,
  getPaginatedProducts,
} = require("../controllers/productController");
const authMiddleWare = require("../middlewares/authMiddleware");
const Product = require("../models/product");

// router.get("/", authMiddleWare, getProducts);
router.get("/", authMiddleWare, async (req, res) => {
  try {
    const username = req.user.username;
    const products = await Product.find();
    res.render("testProducts", { products, username });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Error fetching products");
  }
});

router.delete("/del", async (req, res) => {
  try {
    const result = await Product.deleteMany({});
    res.status(200).json({ message: "All products deleted", result });
  } catch (error) {
    res.status(500).json({ message: "Error deleting products", error });
  }
});
router.post("/addAll", async (req, res) => {
  try {
    const filePath = path.join(__dirname, "../data/products.json"); // Adjust the path as necessary
    const data = fs.readFileSync(filePath, "utf8");

    // Parse the JSON data
    const products = JSON.parse(data);

    // Check if products are an array
    if (!Array.isArray(products)) {
      return res.status(400).json({ message: "Invalid product data." });
    }

    // Save all products to the database
    await Product.insertMany(products);

    // Send a success response
    res.status(201).json({ message: "All products added successfully." });
  } catch (error) {
    console.error("Error adding products:", error);
    res.status(500).json({ message: "Error adding products." });
  }
});

router.get("/nextPage", getPaginatedProducts);
module.exports = router;
