import { v2 as cloudinary } from "cloudinary";
import { StatusCodes } from "http-status-codes";
import Wishlist from "../models/wishlistMode.js";
import Product from "../models/productsModel.js";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Add a product to a wishlist
 * @route POST /api/wishlist/products
 * @access Private
 */
export const addProduct = async (req, res) => {
  try {
    const { name, price, wishlistId, userId } = req.body;

    // Check if wishlist exists and belongs to the user
    const wishlist = await Wishlist.findById(wishlistId);
    if (!wishlist) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Wishlist not found or you do not have access to it",
      });
    }

    console.log(req.file.path);
    let imageUrl = "";
    if (req.file) {
      const base64str = req.file.buffer.toString("base64");
      const dataURI = "data:" + req.file.mimetype + ";base64," + base64str;

      const result = await cloudinary.uploader.upload(dataURI, {
        folder: "products",
      });

      console.log(result.secure_url);
      imageUrl = result.secure_url;
    } else {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Image is required",
      });
    }

    // Create new product
    const product = await Product.create({
      name,
      imageUrl,
      price,
      editedBy: userId,
      wishListId: wishlistId,
    });

    wishlist.products = [...wishlist.products, product._id];
    await wishlist.save();

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Product added to wishlist successfully",
      product,
    });
  } catch (error) {
    console.error("Error adding product to wishlist:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to add product",
      error: error.message,
    });
  }
};

/**
 * Edit a product in a wishlist
 * @route PUT /api/wishlist/products/:productId
 * @access Private
 */
export const editProduct = async (req, res) => {
  try {
    console.log(req.body);
    const { name, price, productId, userId } = req.body;

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if the wishlist belongs to the user
    const wishlist = await Wishlist.findById(product.wishListId);

    if (!wishlist) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "You do not have permission to edit this product",
      });
    }

    // Update the image if a new one is provided
    if (req.file) {
      // Delete the previous image from Cloudinary if it exists
      if (product.imageUrl) {
        // Extract public_id from the URL
        const publicId = product.imageUrl.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`wishlist-products/${publicId}`);
      }

      // Upload new image
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "wishlist-products",
        resource_type: "image",
      });
      product.imageUrl = result.secure_url;
    }

    // Update other fields
    if (name) product.name = name;
    if (price) product.price = price;
    product.editedBy = userId;

    await product.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
};

/**
 * Delete a product from a wishlist
 * @route DELETE /api/wishlist/products/:productId
 * @access Private
 */
export const deleteProduct = async (req, res) => {
  try {
    const { productId, userId } = req.params;
    // Assuming user ID is extracted from auth middleware

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if the wishlist belongs to the user
    const wishlist = await Wishlist.findById(product.wishListId);

    if (!wishlist) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "You do not have permission to delete this product",
      });
    }

    // Delete image from Cloudinary if it exists
    if (product.imageUrl) {
      // Extract public_id from the URL
      const publicId = product.imageUrl.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`wishlist-products/${publicId}`);
    }

    // Remove product from wishlist's products array
    wishlist.products = wishlist.products.filter(
      (p) => p.toString() !== productId
    );
    await wishlist.save();

    // Delete the product
    await Product.findByIdAndDelete(productId);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

/**
 * Get all products in a wishlist
 * @route GET /api/wishlist/:wishlistId/products
 * @access Private
 */
export const getWishlistProducts = async (req, res) => {
  try {
    const { wishlistId } = req.params;

    // Check if wishlist exists and belongs to the user
    const wishlist = await Wishlist.findById(wishlistId);

    if (!wishlist) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Wishlist not found or you do not have access to it",
      });
    }

    // Find all products in the wishlist
    const products = await Product.find({ wishListId: wishlistId }).populate(
      "editedBy",
      "name email"
    ); // Optionally populate user who edited it last

    res.status(StatusCodes.OK).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Error fetching wishlist products:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};
