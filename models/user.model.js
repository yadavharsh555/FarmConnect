import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensure email is unique
  },
  role: {
    type: String,
    enum: ["farmer", "buyer"], // Only allow 'farmer' or 'buyer'
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  number: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  pinCode: {
    type: String,
    required: true,
  },
  profilePic: {
    type: String,
    required: true, // Ensure profilePic is provided
  },
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt fields
});

const User = mongoose.model("User", userSchema);

export default User;
