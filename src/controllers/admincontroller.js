const pool = require("../config/connect");

const getAllusers = async (req,res) => {
   try{
     const {rows} = await pool.query(
        "SELECT id,name,email,role,is_blocked,is_verified,created_at,status FROM users WHERE is_deleted = false ORDER BY created_at DESC"
    );
    res.status(200).json({
        success:true,
        count:rows.length,
        users:rows
    });
   }catch(error){
    console.log("getAllUsers error :",error);
    res.status(500).json({
        success:false,
        message:"server error"
    });
   }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password required",
      });
    }

    // check if user exists
    const checkUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (checkUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // insert user
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, email, password, role || "User"]
    );

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: result.rows[0],
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, status } = req.body;

    const result = await pool.query(
      `UPDATE users 
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           role = COALESCE($3, role),
           status = COALESCE($4, status)
       WHERE id = $5
       RETURNING *`,
      [name, email, role, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: result.rows[0],
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const blockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_blocked } = req.body; // true / false

    const { rows } = await pool.query(
      `UPDATE users
       SET is_blocked = $1,
           updated_at = NOW()
       WHERE id = $2
       RETURNING id, name, email, is_blocked`,
      [is_blocked, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: `User ${is_blocked ? "blocked" : "unblocked"} successfully`,
      user: rows[0],
    });

  } catch (error) {
    console.error("blockUser error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body; // 'user' / 'admin'

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const { rows } = await pool.query(
      `UPDATE users
       SET role = $1,
           updated_at = NOW()
       WHERE id = $2
       RETURNING id, name, email, role`,
      [role, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      user: rows[0],
    });

  } catch (error) {
    console.error("changeUserRole error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// const getDashboardStats = async (req, res) => {
//   try {
//     const users = await pool.query("SELECT COUNT(*) FROM users");
//     const products = await pool.query("SELECT COUNT(*) FROM products");
//     const orders = await pool.query("SELECT COUNT(*) FROM orders");

//     res.json({
//       totalUsers: users.rows[0].count,
//       totalProducts: products.rows[0].count,
//       totalOrders: orders.rows[0].count,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// };
const bulkActionUsers = async (req, res) => {
  try {
    const { ids, action } = req.body;

    if (!ids || !ids.length) {
      return res.status(400).json({
        success: false,
        message: "No users selected",
      });
    }

    let query = "";

    // 🔥 BULK ACTIONS
    if (action === "delete") {
      query = "DELETE FROM users WHERE id = ANY($1)";
    }

    if (action === "block") {
      query = "UPDATE users SET status = 'Blocked' WHERE id = ANY($1)";
    }

    if (action === "activate") {
      query = "UPDATE users SET status = 'Active' WHERE id = ANY($1)";
    }

    const result = await pool.query(query, [ids]);

    return res.status(200).json({
      success: true,
      message: `Bulk ${action} completed successfully`,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
module.exports = {getAllusers, createUser,updateUser,deleteUser,blockUser,changeUserRole,bulkActionUsers};