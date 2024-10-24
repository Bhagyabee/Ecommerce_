const express = require("express");
const router = express.Router();
const Cart = require("../models/cart");
const Product = require("../models/product");

router.post("/addToCart", async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        quantity: quantity,
        price: product.price,
      });
    }
    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    console.log("error adding item to cart");
    res.status(500).json({ message: "Error adding product to cart", error });
  }
});

module.exports = router;
