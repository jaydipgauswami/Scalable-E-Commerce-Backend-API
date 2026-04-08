const express = require("express");
const router = express.Router();
const multer = require("multer");
const productController = require("../controllers/productcontroller");
const {protect,isAdmin} = require("../middlewares/authmiddleware")
const upload = multer({ dest: "uploads/" });

router.get("/getproducts",productController.getProducts);
router.get("/:id",productController.getProductById);

router.post("/",upload.single("image"),productController.createProduct);
router.put("/:id",protect,isAdmin,productController.updateProduct);
router.delete("/:id",protect,isAdmin,productController.deleteProduct);

module.exports = router;