const express = require('express');
const router = express.Router();

const {protect, isAdmin} = require("../middlewares/authmiddleware");
const {getAllusers,blockUser,changeUserRole,getDashboardStats} = require("../controllers/admincontroller");


router.use(protect, isAdmin);

router.get("/users",getAllusers);
router.put("/users/:id/block",blockUser);
router.put("/users/:id/role",changeUserRole);
router.get("/users",getDashboardStats);

module.exports = router;