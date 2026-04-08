const pool = require("../config/connect");

//  Get all categories
exports.getCategories = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM categories ORDER BY id DESC"
    );

    res.status(200).json({
      success: true,
      categories: rows,
    });
  } catch (error) {
    console.error("Get Categories Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

//  Add category (Admin)
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const { rows } = await pool.query(
      "INSERT INTO categories (name) VALUES ($1) RETURNING *",
      [name]
    );

    res.status(201).json({
      success: true,
      message: "Category created",
      category: rows[0],
    });
  } catch (error) {
    console.error("Create Category Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

//  Update category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const { rows } = await pool.query(  
      "UPDATE categories SET name=$1 WHERE id=$2 RETURNING *",
      [name, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category updated",
      category: rows[0],
    });
  } catch (error) {
    console.error("Update Category Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

//  Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    //  Check if category exists
    const categoryCheck = await pool.query(
      "SELECT id FROM categories WHERE id = $1",
      [id]
    );

    if (categoryCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // ❗ Check if category is used in products
    const productCheck = await pool.query(
      "SELECT id FROM products WHERE category_id = $1 LIMIT 1",
      [id]
    );

    if (productCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Category is used in products, cannot delete",
      });
    }

    //  Safe to delete
    await pool.query("DELETE FROM categories WHERE id = $1", [id]);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });

  } catch (error) {
    console.error("Delete Category Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};