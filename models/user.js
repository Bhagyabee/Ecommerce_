const { type } = require("express/lib/response");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now() },
  isActive: { type: Boolean, default: true },
  role: { type: String, default: "user" },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  address: { type: mongoose.Schema.Types.ObjectId, ref: "Address" },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
