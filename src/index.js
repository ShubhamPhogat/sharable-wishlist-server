//express server
import express from "express";
import cookieParser from "cookie-parser";
import userRouter from "./routes/userRoute.js";
import dotenv from "dotenv";
import connectDb from "./db.js";
import findConfig from "find-config";
import cors from "cors";

import wishlistRouter from "./routes/wishListRouter.js";
import prodcutRouter from "./routes/productRouter.js";

dotenv.config({ path: findConfig("/.env") });
const app = express();
connectDb();

//middleware
app.use(cors({ origin: true }));
app.use((req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*");
  next();
});
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
//routes
app.use("/api/users", userRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/product", prodcutRouter);

app.listen(8000, () => {
  console.log("Server is running on port 8000");
});
