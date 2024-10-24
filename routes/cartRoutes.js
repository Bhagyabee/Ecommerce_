const express = require("express");
const router = express.Router();
const Cart = require("../models/cart");
const Product = require("../models/product");
const authMiddleWare = require("../middlewares/authMiddleware");

router.post("/addToCart", authMiddleWare, async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    console.log(product.stock, quantity);

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }
    // if (product.stock <  quantity) {
    //   return res.status(400).json({ message: "Insufficient stock available" });
    // }
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );
    if (itemIndex > -1) {
      if (product.stock < cart.items[itemIndex].quantity + quantity) {
        return res
          .status(400)
          .json({ message: "Insufficient stock available" });
      }
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
    console.error("Error adding to cart:", err);
    res.status(500).json({ message: "Error adding product to cart", err });
  }
});
router.get("/", authMiddleWare, async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    const cartItems = cart ? cart.items : [];
    res.json({ items: cartItems }); // Return JSON
  } catch (error) {
    console.error("Error fetching cart items:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/myCart", authMiddleWare, async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user ID is stored in the token
    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    console.log(cart);

    const cartItems = cart ? cart.items : [];

    res.render("MyCart", { cartItems, req });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update quantity of a cart item
router.patch("/updateQuantity", authMiddleWare, async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    const userId = req.user.id;

    const cartUser = await Cart.findOne({ user: userId });
    const cartItem = cartUser.items.id(itemId);
    if (!cartItem) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    const product = await Product.findById(cartItem.product);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (product.stock < quantity) {
      return res.status(400).json({ message: "Insufficient stock available" });
    }

    const cart = await Cart.findOneAndUpdate(
      { user: userId, "items._id": itemId },
      { $set: { "items.$.quantity": quantity } },
      { new: true } // Return the updated cart
    );

    if (!cart) {
      return res.status(404).json({ message: "Cart or item not found" });
    }

    res.json(cart.items);
  } catch (error) {
    console.error("Error updating cart item quantity:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/removeItem", authMiddleWare, async (req, res) => {
  const { itemId } = req.body;

  if (!itemId) {
    return res.status(400).json({ message: "Item Id is required" });
  }
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Item not found" });
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);

    await cart.save();
    return res.status(200).json({ message: "Item removed from cart" });
  } catch (error) {
    console.error("Error removing item", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error in removing item" });
  }
});

module.exports = router;
