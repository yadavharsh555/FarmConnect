import mongoose from 'mongoose';

const acceptedContractSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true
  },
  Cname: {
    type: String,
    required: true
  },
  Ctype: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['accepted'],
    default: 'accepted'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware to update `updatedAt` on every save
acceptedContractSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Create the model
const AcceptedContract = mongoose.model('AcceptedContract', acceptedContractSchema);

export default AcceptedContract;
