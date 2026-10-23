import mongoose from "mongoose";

const connectDB = async (mongoUri: string): Promise<void> => {
  const conn = await mongoose.connect(mongoUri);
  console.log(`MongoDB Connected: ${conn.connection.host}`);
};

export default connectDB;