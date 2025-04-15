// middleware/adminMiddleware.js
const adminMiddleware = (req, res, next) => {
    // This assumes req.user was set by authMiddleware
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
  
    // Check if the user has the "Admin" role
    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }
    
    next();
  };
  
  module.exports = adminMiddleware;
  