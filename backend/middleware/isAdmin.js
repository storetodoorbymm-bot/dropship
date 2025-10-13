const User = require("../models/User");

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId); 
    const isAdmin = (req, res, next) => {
  if (req.userRole === "admin") {
    next();
  } else {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
};

module.exports = isAdmin;

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = isAdmin;
