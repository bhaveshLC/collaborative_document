import { config } from "../config/config.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
async function userLogin(email, password) {
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    const error = new Error("Invalid password");
    error.statusCode = 401;
    throw error;
  }
  const token = jwt.sign(
    {
      _id: user._id,
      name: user.name,
    },
    config.JWT_SECRET,
    {
      expiresIn: config.JWT_Expiry,
    }
  );
  return token;
}
async function registerUser(user) {
  const existingUser = await User.findOne({ email: user.email });
  if (existingUser) {
    const error = new Error("User already exists");
    error.statusCode = 409;
    throw error;
  }
  const newUser = await User.create(user);
  await newUser.save();
  return newUser;
}

export const authService = {
  userLogin,
  registerUser,
};
