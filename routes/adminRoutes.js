const express = require("express");
const router = express.Router();
const authMiddleWare = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/isAdmin");
const User = require("../models/user");
const Product = require("../models/product");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/; // Accept only jpg, jpeg, png
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb("Error: Only images are allowed!");
    }
  },
});

router.post(
  "/addProduct",
  authMiddleWare,
  isAdmin,
  upload.single("PImage"),
  async (req, res) => {
    const { PName, PDesc, PPrice, PQuantity, PImage } = req.body;

    if (!PName || !PDesc || !PPrice || !PQuantity || !req.file) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const uniqueId = Date.now() + Math.floor(Math.random() * 10000);
    const img = `/uploads/${req.file.filename}`;
    try {
      const newProduct = new Product({
        id: uniqueId,
        name: PName,
        detailsUrl: PDesc,
        price: PPrice,
        stock: PQuantity,
        image: img,
        user: req.user._id,
      });
      await newProduct.save();
      const products = await Product.find({ user: req.user._id });
      res.render("addProduct", { req, products });
    } catch (error) {
      console.error("Error adding product:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);
router.get("/addProduct", authMiddleWare, isAdmin, async (req, res) => {
  const products = await Product.find({ user: req.user._id });
  res.render("addProduct", { req, products });
});

router.get("/updateProduct/:id", authMiddleWare, isAdmin, async (req, res) => {
  const productId = req.params.id;
  const product = await Product.findById(productId);

  res.render("updateform", { product, req });
});

router.post(
  "/updateProduct/:id",
  authMiddleWare,
  isAdmin,
  upload.single("PImage"),
  async (req, res) => {
    const { id } = req.params;
    const { PName, PDesc, PPrice, PQuantity, PImage } = req.body;
    let img;
    if (req.file) {
      img = `/uploads/${req.file.filename}`;
    } else {
      const existingProduct = await Product.findById(req.params.id);
      img = existingProduct.image; // retain the existing image if none is uploaded
    }
    try {
      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id, // Use the route parameter here
        {
          name: PName,
          detailsUrl: PDesc,
          price: PPrice,
          stock: PQuantity,
          image: img,
        },
        { new: true }
      );

      if (!updatedProduct) {
        return res.status(404).send("Product not found");
      }

      res.redirect("/api/admin/addProduct");
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).send("Server error");
    }
  }
);

router.delete(
  "/deleteProduct/:id",
  authMiddleWare,
  isAdmin,
  async (req, res) => {
    try {
      const productId = req.params.id;
      const deletedProduct = await Product.findByIdAndDelete(productId);

      if (!deletedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);
module.exports = router;
