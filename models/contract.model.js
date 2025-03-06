import mongoose from "mongoose";

const contractSchema = new mongoose.Schema({
  Cname: {
    type: String,
    required: true,
  },
  Ctype: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  role: {
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
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    // Required if a buyer must be specified
  },
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    // Required if a farmer must be specified
  },
  status: {
    type: String,
  },
});

const Contract = mongoose.model("Contract", contractSchema);
export default Contract;
