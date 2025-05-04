//make a product model
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  editedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  wishListId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Wishlist",
  },
});

const Product = mongoose.model("Product", productSchema);

export default Product;
