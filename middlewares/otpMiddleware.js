const cors = require("cors");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
const OTP = require("../models/otp");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

function validatePassword(password) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return regex.test(password);
}
const generateOtp = async (req, res) => {
  const { email, username, password } = req.body;
  console.log(email);
  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({
      message:
        " New password should contain at least 1 uppercase 1 lowercase and 1 number and at least 8 characters long",
    });
  }
  const existUser = await User.findOne({ email });
  if (existUser) {
    return res.render("already");
  }

  const otp = otpGenerator.generate(6, {
    digits: true,
    alphabets: false,
    upperCase: false,
    specialChars: false,
  });

  try {
    await OTP.create({ email, otp });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "bhagyabeeb@gmail.com",
        pass: "ryunkpmqcxtxxjrt",
      },
    });

    await transporter.sendMail({
      from: "bhagyabeeb@gmail.com",
      to: email,
      subject: "OTP Verification",
      text: `Your OTP for verification is ${otp}`,
    });

    res.status(200).json({ message: "ok" });

    // res.render("verifyOtp", { email, username, password });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error sending OTP");
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp, password, username } = req.body;
  console.log(email, otp, password, username);
  try {
    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(401).json({ message: "User already exist" });
    }
    const otpRecord = await OTP.findOne({ email, otp }).exec();
    console.log(otpRecord);

    if (!otpRecord) {
      return res.status(401).json({ message: "Invalid Otp" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ username, email, password: hashedPassword });

    res.redirect("/api/auth/login");
  } catch (err) {
    console.log(err);
    res.status(500).send("Error Verifying OTP");
  }
};

module.exports = {
  generateOtp,
  verifyOtp,
};
