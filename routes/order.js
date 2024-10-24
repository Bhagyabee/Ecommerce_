const express = require("express");
const router = express.Router();
const authMiddleWare = require("../middlewares/authMiddleware");
const Order = require("../models/order");
const Address = require("../models/address");
const User = require("../models/user");
const Cart = require("../models/cart");

router.get("/details/:orderId", authMiddleWare, async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    console.log(order);

    res.render("order", { order });
  } catch (error) {
    res.status(500).json({ message: "Error fetching order details" });
  }
});

router.post("/placeOrder", authMiddleWare, async (req, res) => {
  try {
    const userId = req.user._id;
    const userCart = await Cart.findOne({ user: userId }).populate(
      "items.product"
    );
    if (!userCart || !userCart.items || userCart.items.length === 0) {
      return res
        .status(400)
        .json({ message: "User cart is empty or not found" });
    }
    // Retrieve the user's address from the address schema
    const user = await User.findById(userId).populate("address"); // Adjust according to your schema
    console.log(user);
    // Check if the user address exists
    if (!user || !user.address) {
      return res.status(404).json({
        message: "User address not found . Please add address in profile page",
      });
    }

    for (let item of userCart.items) {
      const product = item.product;

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${product.name}. Only ${product.stock} left in stock.`,
        });
      }
    }

    const newOrder = new Order({
      user: userId,
      products: userCart.items.map((item) => ({
        productId: item.product._id, // Store product ID
        name: item.product.name, // Store product name
        price: item.product.price, // Store product price at the time of the order
        quantity: item.quantity, // Store product quantity
      })),
      shippingAddress: {
        street: user.address.street,
        city: user.address.city,
        state: user.address.state,
        postalCode: user.address.postalCode,
        country: user.address.country,
      },
      totalAmount: req.body.totalPrice, // Use the total price from the request body
    });

    await newOrder.save();
    console.log(newOrder);

    for (let item of userCart.items) {
      const product = item.product;
      product.stock -= item.quantity; // Decrease the stock by the quantity ordered
      await product.save(); // Save the updated product stock to the database
    }

    // Clear the user's cart after order is placed
    userCart.items = []; // Empty the cart
    await userCart.save();

    res
      .status(200)
      .json({ message: "Order placed successfully", orderId: newOrder._id });
  } catch (error) {
    console.error("Error placing order:", error); // Log the error for debugging
    res.status(500).json({ message: "Error placing order" });
  }
});

module.exports = router;
