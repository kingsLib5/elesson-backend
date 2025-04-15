const nodemailer = require("nodemailer");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");


console.log("JWT_SECRET:", process.env.JWT_SECRET); // Debugging line

// Configure nodemailer transporter (using Gmail as an example)
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // true for port 465, false for other ports
      auth: {
        user: process.env.EMAIL_USERNAME, // your Gmail address
        pass: process.env.EMAIL_PASSWORD, // your Gmail App Password
      },
      tls: {
        rejectUnauthorized: false, // Optional, sometimes helps with certificate issues
      },
      // Force IPv4 by overriding the default DNS lookup (optional)
      lookup: (hostname, options, callback) => {
        require("dns").lookup(hostname, { family: 4 }, callback);
      },
    });


// Register User
const registerUser = async (req, res) => {
  const { firstName, lastName, username, email, phoneNumber, state, password, role } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      username,
      email,
      phoneNumber,
      state,
      password,
      role,
    });

    await newUser.save();

    // Generate JWT
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({ token, user: newUser, role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { emailOrPhone, password } = req.body;
  try {
    // Find user by email or phone number
    const user = await User.findOne({
      $or: [{ email: emailOrPhone }, { phoneNumber: emailOrPhone }],
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT with role included in the payload
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Example backend endpoint in authController.js
const getUserDetails = async (req, res) => {
  try {
    // Assume req.user is set by an authentication middleware
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update user details (e.g., profile image)
const updateUserDetails = async (req, res) => {
  try {
    // req.user.id is set by your auth middleware
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: req.body.profileImage }, // Update the profileImage field
      { new: true }
    ).select("-password");
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating user details:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    // For security, do not reveal if the email doesn't exist.
    if (!user) {
      return res.status(200).json({
        message: "If that email is registered, you will receive further instructions." 
      });
    }

    // If newPassword and confirmPassword are not provided, prompt for them.
    if (!newPassword && !confirmPassword) {
      return res.status(200).json({
        emailFound: true,
        message: "Email found. Please enter your new password."
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    // Update the password using the document save method so that the pre-save hook runs
    user.password = newPassword; // This triggers the pre-save hook to hash the new password.
    await user.save();

    // Send an email notification to the user
    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: user.email,
      subject: "Your password has been reset",
      text: `Hello ${user.firstName},\n\nYour password has been successfully updated. If you did not request this change, please contact our support immediately.\n\nRegards,\nYour Team`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Error sending email:", err);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    return res.status(200).json({
      success: true,
      message: "Your password has been updated. A notification email has been sent."
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// In authcontroller.js
const getUserCount = async (req, res) => {
  try {
    // Count only users whose role is not "Admin"
    const userCount = await User.countDocuments({ role: { $ne: "Admin" } });
    res.status(200).json({ count: userCount });
  } catch (err) {
    console.error("Error fetching user count:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    // Only include users whose role is not "Admin"
    const users = await User.find({ role: { $ne: "Admin" } });
    res.status(200).json({ users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { registerUser, loginUser, getUserDetails, updateUserDetails, forgotPassword, getUserCount, getAllUsers, };