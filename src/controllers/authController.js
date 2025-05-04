import { User } from "../models/userModel.js";
import bcryptjs from "bcryptjs"; // Changed from bcrypt to bcryptjs
import Wishlist from "../models/wishlistMode.js";

export const registerUser = async (req, res) => {
  try {
    let { firstName, lastName, email, userName, phone, password, role } =
      req.body;

    if (!role) {
      role = "user";
    }

    if (!firstName || !email || !userName || !phone || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(200).json({ message: "user already exisita" });
    }

    // Using bcryptjs instead of bcrypt
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(String(password), salt);

    const newUser = await new User({
      firstName,
      lastName,
      email,
      userName,
      phone,
      password: hashedPassword,
      role,
    });

    await newUser.save({ validateBeforeSave: false });

    const chqUser = await User.findById(newUser._id);

    if (chqUser) {
      return res.status(200).json({ data: chqUser });
    } else {
      return res
        .status(500)
        .json({ message: "internal error fialed to register user" });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Error registering user",
      error: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const validateUser = await User.findOne({ email });

    if (!validateUser) {
      return res.status(400).json({ message: "wrong credentials" });
    }

    // Using bcryptjs instead of bcrypt for comparison
    const isPasswordCorrect = await bcryptjs.compare(
      String(password),
      validateUser.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "wrong credentials pass" });
    }

    const refreshToken = await validateUser.generateRefreshToken();
    const accessToken = await validateUser.generateAccessToken();

    await User.findByIdAndUpdate(
      validateUser._id,
      { $set: { refreshToken } },
      { new: true, runValidators: false }
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    const loggedInUser = await User.findById(validateUser._id).select(
      "-password -refreshToken"
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        data: {
          user: loggedInUser,
          refreshToken,
          accessToken,
        },
        success: true,
      });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error during login",
      success: false,
    });
  }
};

// Function to reset password in case you need it
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res
        .status(400)
        .json({ message: "Email and new password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Using bcryptjs for new password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(String(newPassword), salt);

    user.password = hashedPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      message: "Password reset successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error resetting password",
      success: false,
    });
  }
};

export const loggoutUser = async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { refreshToken: 1 }, //remove field from document-> error for $set refreshToken: undefined
    },
    { new: true }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json({ message: "logout successful" });
};

export const deleteUserByEmail = async (req, res) => {
  const email = req.body.email;
  try {
    // Assuming you have a User model imported
    const result = await User.findOneAndDelete({ email });

    if (result) {
      console.log(`User with email ${email} has been deleted successfully.`);
      return { success: true, message: `User with email ${email} deleted.` };
    } else {
      console.log(`User with email ${email} not found.`);
      return { success: false, message: `User with email ${email} not found.` };
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, message: "Error deleting user.", error };
  }
};

export const getUsersWishlist = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(404).json({ message: "id not found" });
    }
    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ message: "user not found" });
    }
    let wishListArray = [];
    for (let wslId of user.wishList) {
      const wsl = await Wishlist.findById(wslId);
      if (wsl) {
        wishListArray.push(wsl);
      }
    }
    return res.status(200).json(wishListArray);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "internal error fialed to fetch userWishList" });
  }
};
