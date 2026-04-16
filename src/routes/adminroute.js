const express = require('express');
const router = express.Router();

const {protect, isAdmin} = require("../middlewares/authmiddleware");
const {getAllusers,blockUser,changeUserRole,createUser,updateUser,deleteUser,bulkActionUsers} = require("../controllers/admincontroller");
router.use(protect);
router.use(isAdmin);
router.use(protect, isAdmin);
router.get("/users",getAllusers);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.put("/users/:id/block",blockUser);
router.post("/users/bulk",bulkActionUsers);
router.put("/users/:id/role",changeUserRole);
// router.get("/users/stats",getDashboardStats);

module.exports = router;