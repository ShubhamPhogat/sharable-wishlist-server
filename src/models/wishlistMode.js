//make a wishlist model
import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  ownerName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  products: [],
  ownerId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
});

const Wishlist = mongoose.model("Wishlist", wishlistSchema);

export default Wishlist;
