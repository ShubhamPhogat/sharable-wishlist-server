import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
    unique: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
  },
  role: {
    type: String,
    default: "User",
  },
  wishList: [],
  refresToken: {
    type: String,
    default: "",
  },
});

// Fix the async middleware - this was causing the silent hang

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      userName: this.userName,
    },
    process.env.ACCESS_WEB_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_WEB_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_WEB_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_WEB_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
