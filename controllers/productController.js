const fs = require("fs");
const path = require("path");

const getPaginatedProducts = async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Get the current page from query parameter
  const productsPerPage = 5; // Set the number of products to show per page
  const filePath = path.join(__dirname, "../data/products.json");

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading product file:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    const products = JSON.parse(data);
    const start = (page - 1) * productsPerPage;
    const paginatedProducts = products.slice(start, start + productsPerPage);

    // Respond with JSON instead of rendering a page
    res.json(paginatedProducts);
  });
};

const getProducts = async (req, res) => {
  const username = req.user?.username || null; // Safe way to get username
  const filePath = path.join(__dirname, "../data/products.json");

  // Get the page number from the query parameters, default to 1
  const page = parseInt(req.query.page) || 1;
  const limit = 5; // Number of products to return per page
  const startIndex = (page - 1) * limit; // Calculate the starting index

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading product file:", err);
      return res.status(500).send("Internal Server Error");
    }

    let products;
    try {
      products = JSON.parse(data); // Parse the JSON data
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      return res.status(500).send("Internal Server Error");
    }

    const paginatedProducts = products.slice(startIndex, startIndex + limit); // Get products for the current page
    res.render("products", {
      products: paginatedProducts,
      username: username,
      currentPage: page,
    });
  });
};

module.exports = { getProducts, getPaginatedProducts };
