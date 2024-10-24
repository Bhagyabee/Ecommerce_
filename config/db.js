const mongoose = require("mongoose");

async function connectToDatabase() {
  const MONGODB_URL =
    "mongodb+srv://bhagyabeeb:kGY8jqQwQBsa6d37@cluster0.dmxjz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

  mongoose
    .connect(MONGODB_URL)
    .then(() => {
      console.log("Successfully Connected to Db");
    })
    .catch((error) => {
      console.log("Error connecting to MongoDb", error);
    });
}

module.exports = connectToDatabase;
