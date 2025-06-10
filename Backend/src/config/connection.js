import mongoose, { connect } from "mongoose";

export const connectToDB = async (url) => {
  mongoose
    .connect(url)
    .then(() => console.log("Database connected successfully."))
    .catch((err) => console.log(err));
};
