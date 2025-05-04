import {
  createWishList,
  fetchWishListProducts,
  getWishlistById,
  joinWishList,
} from "../controllers/wishListController.js";

import express from "express";
const wishlistRouter = express.Router();

wishlistRouter.get("/get/:id", getWishlistById);
wishlistRouter.get("/getWishlist/:wishListId", fetchWishListProducts);
wishlistRouter.post("/create", createWishList);
wishlistRouter.post("/join", joinWishList);

export default wishlistRouter;
