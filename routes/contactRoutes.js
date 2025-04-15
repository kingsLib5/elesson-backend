// routes/contactRoutes.js
const express = require("express");
const router = express.Router();
const { createContactMessage, getContactMessages, deleteContactMessage } = require("../controllers/contactController");

// POST route for submitting a new contact message
router.post("/", createContactMessage);

// GET route for fetching all contact messages
router.get("/", getContactMessages);

// DELETE route for deleting a contact message by ID
router.delete("/:id", deleteContactMessage);

module.exports = router;
