import User from "../models/user.js";

export const authorizeRoles = (...roles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id).select("role");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (!roles.includes(user.role)) {
        return res.status(403).json({ message: "Access denied for this role" });
      }
      req.userRole = user.role;
      next();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
};
