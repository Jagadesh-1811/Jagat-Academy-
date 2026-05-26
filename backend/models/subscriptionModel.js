import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  planType: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['trial', 'active', 'grace_period', 'expired', 'cancelled'],
    default: 'trial'
  },
  trialEndsAt: {
    type: Date
  },
  gracePeriodEndsAt: {
    type: Date
  },
  installmentPayments: [{
    amount: { type: Number },
    dueDate: { type: Date },
    status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
    paidAt: { type: Date }
  }],
  billingCycle: {
    type: String,
    default: 'monthly'
  }
}, {
  timestamps: true
});

const Subscription = mongoose.model("Subscription", subscriptionSchema);
export default Subscription;
