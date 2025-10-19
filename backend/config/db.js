import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const DBuri=process.env.MONGODB_URI;
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(DBuri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
