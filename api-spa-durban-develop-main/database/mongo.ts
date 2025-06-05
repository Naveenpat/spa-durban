// Import necessary modules
import mongoose from "mongoose";
import config from "../config/config";

// MongoDB connection URL
const mongoURI = config.mongoose.url; // Replace with your MongoDB URI
const mongoOptions = config.mongoose.options; // Replace with your MongoDB options

// Connect to MongoDB with options
mongoose.connect(mongoURI, { ...mongoOptions });

// Access Mongoose connection
const db = mongoose.connection;

// Handle connection events
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
  // You can start using your schemas and models here
});
