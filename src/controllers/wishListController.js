import Product from "../models/productsModel.js";
import { User } from "../models/userModel.js";
import Wishlist from "../models/wishlistMode.js";

export const getWishlistById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(404).json({ message: "id not found" });
    }
    const wishList = await Wishlist.findById(id);
    if (!wishList) {
      return res.status(404).json({ message: "wishList not found" });
    }
    return res.json(wishList);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "error in fetching wishlist", error });
  }
};

export const joinWishList = async (req, res) => {
  try {
    const { wishListId, userId } = req.body;
    if (!wishListId || !userId) {
      return res.status(404).json({ message: "ids not found" });
    }
    const wishList = await Wishlist.findById(wishListId);
    if (!wishList) {
      return res.status(404).json({ message: "wishList not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    if (user.wishList.includes(wishListId)) {
      res.status(300).json({ message: "wishlist already joined" });
    }
    user.wishList.push(wishListId);
    await user.save({ runValidators: false });
    return res.status(200).json({ message: "wishlist joined successfully" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "error in joining wishlist", error });
  }
};
export const fetchWishListProducts = async (req, res) => {
  try {
    const { wishListId } = req.param;
    if (!wishListId) {
      return res.status(404).json({ message: "ids not found" });
    }
    const wishList = await Wishlist.findById(wishListId);
    if (!wishList) {
      return res.status(404).json({ message: "wishList not found" });
    }
    const productArray = [];
    for (id of wishList.products) {
      const product = await Product.findById(id);
      productArray.push(product);
    }
    return res.status(200).json(productArray);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "error in getting wishlist", error });
  }
};
export const createWishList = async (req, res) => {
  try {
    const { name, ownerName, email, userId } = req.body;
    if (!name || !ownerName || !email || !userId) {
      return res.status(404).json({ message: "no enough data" });
    }
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "user not found" });
    }
    const wishList = await new Wishlist({
      name,
      ownerName,
      email,
      ownerId: userId,
    });
    const newWishList = await wishList.save();
    user.wishList.push(newWishList);
    await user.save({ validateBeforeSave: false });
    res.json(newWishList);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "error in creating wishlist", error });
  }
};
