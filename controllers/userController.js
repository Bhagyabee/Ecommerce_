const bcrypt = require("bcryptjs/dist/bcrypt");
const User = require("../models/user");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const Address = require("../models/address");

function validatePassword(password) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return regex.test(password);
}

const changePassword = async (req, res) => {
  console.log(req.body);
  const { oldpassword, newpassword, validatepassword, _id } = req.body;
  const password = newpassword;

  if (!oldpassword || !newpassword || !validatePassword(newpassword)) {
    return res.status(400).json({
      message: "All fields are required and new password must meet criteria",
    });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({
      message:
        " New password should contain at least 1 uppercase 1 lowercase and 1 number and at least 8 characters long",
    });
  }

  const user = await User.findById({ _id });

  // console.log(user);
  console.log(req.body.newpassword);

  const isMatch = await bcrypt.compare(oldpassword, user.password);
  console.log(isMatch);
  if (!isMatch) {
    return res.status(400).json({ message: "Incorrect old password" });
  }

  const newhash = await bcrypt.hash(newpassword, 10);
  user.password = newhash;
  await user.save();

  console.log("user after updating password", user);

  return res.status(200).json({ message: "ok" });
};

const GetResetLink = async (req, res) => {
  const { email } = req.body;
  console.log("email in get link ", email);
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User with this email doesnot exist" });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const resetUrl = `http://localhost:3000/api/user/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "bhagyabeeb@gmail.com",
        pass: "ryunkpmqcxtxxjrt",
      },
    });

    const mailOptions = {
      from: "bhagyabeeb@gmail.com",
      to: email,
      subject: "Password Reset",
      text: "here is your password link",
      html: `<p>You requested a password reset. Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Reset password email sent" });
  } catch (error) {
    console.error("Error sending email:", error);
    if (error.response) {
      return res.status(500).json({ message: "Failed to send email" });
    } else {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  console.log(password);
  if (!validatePassword(password)) {
    return res.status(400).json({
      message:
        " New password should contain at least 1 uppercase 1 lowercase and 1 number and at least 8 characters long",
    });
  }

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.log(err, "err in reset password");
  }
};

const seller = async (req, res) => {
  const userId = req.user._id;
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        role: "admin",
      },
      {
        new: true,
      }
    );

    if (user) {
      console.log("Now You are an admin");
      res.render("Congrats you are a seller now.");
    } else {
      console.log("User Not found");
    }
  } catch (error) {
    console.error("Error updating user role", error);
    return res.status(400).json({ message: "Error updating user role" });
  }
};

const addAddress = async (req, res) => {
  const userId = req.user._id;
  const { street, city, state, pin, country } = req.body;
  if (!street || !city || !state || !pin || !country) {
    res.status(500).json({ message: "All fields are required" });
  }
  const newAddress = new Address({
    street,
    city,
    state,
    postalCode: pin,
    country,
  });

  await newAddress.save();

  try {
    const user = await User.findByIdAndUpdate(userId, {
      address: newAddress._id,
    });

    res.status(200).send("Address successfully added.");
  } catch (error) {
    console.error("Error adding address:", error);
    res.status(500).send("Server error");
  }
};

module.exports = {
  changePassword,
  resetPassword,
  GetResetLink,
  seller,
  addAddress,
};
