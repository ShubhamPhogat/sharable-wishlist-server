import express from "express";
import {
  addProduct,
  deleteProduct,
  editProduct,
  getWishlistProducts,
} from "../controllers/productController.js";
import multer from "multer";
const prodcutRouter = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

prodcutRouter.post("/create", upload.single("productImage"), addProduct);
prodcutRouter.put("/edit", upload.single("productImage"), editProduct);
prodcutRouter.delete("/delete/:productId", deleteProduct);
prodcutRouter.get("/get/:wishlistId", getWishlistProducts);

export default prodcutRouter;
