import User from "../models/user.model.js";

const getUsers = async () => {
  const users = await User.find();
  return users;
};

const getUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  return user;
};

export const userService = {
  getUsers,
  getUser,
};
