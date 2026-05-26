import mongoose from 'mongoose';

const redemptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    item: {
      type: String,
      enum: ['discount_coupon', 'extended_access', 'exclusive_content', 'merchandise'],
      required: true,
    },
    coinsCost: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'delivered'],
      default: 'pending',
    },
    code: {
      type: String, // Generates digital voucher/coupon key
    },
  },
  { timestamps: true }
);

const Redemption = mongoose.model('Redemption', redemptionSchema);
export default Redemption;
