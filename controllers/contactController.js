// controllers/contactController.js
const ContactMessage = require("../models/ContactMessage");

// Controller to handle POST request: save a new contact message
exports.createContactMessage = async (req, res) => {
  try {
    const { fullName, email, phone, message } = req.body;

    // Ensure all required fields are provided
    if (!fullName || !email || !phone || !message) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill all required fields." });
    }

    // Create a new instance of ContactMessage
    const newContact = new ContactMessage({
      fullName,
      email,
      phone,
      message,
    });

    // Save to MongoDB
    await newContact.save();

    // Respond with the stored data
    res.status(201).json({ success: true, data: newContact });
  } catch (error) {
    console.error("Error saving contact message:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Controller to handle GET request: fetch all contact messages
exports.getContactMessages = async (req, res) => {
  try {
    // Retrieve messages from MongoDB, sorted by newest first
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ success: false, message: "Error fetching messages" });
  }
};

// Controller to delete a contact message by ID
exports.deleteContactMessage = async (req, res) => {
    try {
      const { id } = req.params;
      const deletedMessage = await ContactMessage.findByIdAndDelete(id);
      if (!deletedMessage) {
        return res.status(404).json({ success: false, message: "Message not found" });
      }
      res.json({ success: true, data: deletedMessage });
    } catch (error) {
      console.error("Error deleting message:", error);
      res.status(500).json({ success: false, message: "Error deleting message" });
    }
  };
