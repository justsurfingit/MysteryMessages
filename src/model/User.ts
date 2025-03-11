import mongoose, { Document, Schema } from "mongoose";
import { defaultConfig } from "next/dist/server/config-shared";

// okay lets begin
// first intferace and then it might be good to go
export interface message extends Document {
  content: string;
  createdAt: Date;
}
export interface user extends Document {
  username: string;
  email: string;
  password: string;
  verificationCode: string;
  isVerified: boolean;
  verificationCodeExpiry: Date;
  isAccepting: boolean;
  messages: message[];
}
// now create mongo schema
const messageSchema: Schema<message> = new Schema({
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now(),
  },
});
const userSchema: Schema<user> = new Schema({
  username: {
    type: String,
    required: [true, "User Name is required field"],
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    match: [/^[^s@]+@[^s@]+.[^s@]+$/, "Please enter a valid email address"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationCode: {
    type: String,
    required: [true, "Verification code is required"],
  },
  verificationCodeExpiry: {
    type: Date,
    required: [true, "Verification codeExpiry is required"],
  },
  isAccepting: {
    type: Boolean,
    default: true,
  },
  messages: [messageSchema],
});
const userModel =
  (mongoose.models.User as mongoose.Model<user>) ||
  mongoose.model<user>("User", userSchema);
export default userModel;
