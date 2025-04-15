// index.js
const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const bodyparser = require("body-parser");

const connectDB = require("./dbconnect/dbconfig"); // Database connection file
const authRoutes = require("./routes/authRoutes"); // Import auth routes

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(bodyparser.urlencoded({ extended: false, limit: "50mb" }));
app.use(bodyparser.json({ limit: "50mb" }));

// Existing Routes
app.use("/api/auth", authRoutes);

// New Contact Route: POST and GET endpoints for contact messages
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));


// Start server
app.listen(port, () => console.log(`Server started on port ${port}`));
