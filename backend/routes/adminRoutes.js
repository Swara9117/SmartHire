import express from "express";
import { verifyToken } from "../middleware/verify.js";
import { authorizeRoles } from "../middleware/authorize.js";
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
  getDashboardAnalytics,
  seedAdmin,
} from "../controller/adminController.js";

const router = express.Router();

router.post("/seed", seedAdmin);

router.get("/users", verifyToken, authorizeRoles("Admin"), getAllUsers);
router.patch("/users/:id/role", verifyToken, authorizeRoles("Admin"), updateUserRole);
router.delete("/users/:id", verifyToken, authorizeRoles("Admin"), deleteUser);
router.get("/analytics", verifyToken, authorizeRoles("Admin"), getDashboardAnalytics);

export default router;
