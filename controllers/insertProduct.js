const fs = require("fs"); // To read the file
const path = require("path");
const Product = require("../models/product");
const mongoose = require("../app");

const filePath = path.join(__dirname, "../data/products.json");

fs.readFile(filePath, "utf-8", (err, data) => {
  if (err) {
    console.error("Error reading file", err);
    return;
  }

  try {
    const products = JSON.parse(data);

    Product.insertMany(products).then(() => {
      console.log("Products added successfully");
    });
  } catch (parseError) {
    console.log("error parsing Json", parseError);
  }
});
