import Course from "../models/courseModel.js";
import User from "../models/userModel.js";
import Subscription from "../models/subscriptionModel.js";
import Order from "../models/orderModel.js";
import razorpay from 'razorpay';
import dotenv from "dotenv";

dotenv.config();

const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

/**
 * Create a new subscription or installment plan
 */
export const createSubscription = async (req, res) => {
  try {
    const { courseId, planType, trialDays, installmentOption } = req.body;
    const userId = req.userId;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const startDate = new Date();
    let endDate = new Date();
    let trialEndsAt = null;

    if (trialDays) {
      trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + parseInt(trialDays));
    }

    if (planType === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (planType === 'quarterly') {
      endDate.setMonth(endDate.getMonth() + 3);
    } else if (planType === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // Installment setup (e.g. 50% now, 50% later)
    let installmentPayments = [];
    if (installmentOption === '50_50') {
      const halfPrice = (course.price || 999) / 2;
      installmentPayments = [
        { amount: halfPrice, dueDate: new Date(), status: 'pending' },
        { amount: halfPrice, dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), status: 'pending' }
      ];
    }

    const subscription = new Subscription({
      student: userId,
      course: courseId,
      planType: planType || 'monthly',
      startDate,
      endDate,
      status: trialDays ? 'trial' : 'active',
      trialEndsAt,
      installmentPayments
    });

    await subscription.save();

    // Auto-enroll student (free trial / sandbox mock activation)
    const user = await User.findById(userId);
    if (user && !user.enrolledCourses.includes(courseId)) {
      user.enrolledCourses.push(courseId);
      await user.save();
    }

    if (!course.enrolledStudents.includes(userId)) {
      course.enrolledStudents.push(userId);
      await course.save();
    }

    res.status(201).json({
      success: true,
      message: "Subscription/Installment plan created successfully",
      subscription
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Calculate proration cost for upgrading/downgrading
 */
export const calculateProration = async (req, res) => {
  try {
    const { subscriptionId, targetPlanType } = req.body;
    const subscription = await Subscription.findById(subscriptionId).populate('course');

    if (!subscription) return res.status(404).json({ message: "Subscription not found" });

    const totalDuration = subscription.endDate - subscription.startDate;
    const timeUsed = new Date() - subscription.startDate;
    const ratioRemaining = Math.max(0, 1 - (timeUsed / totalDuration));

    const originalPrice = subscription.course.price || 999;
    const remainingValue = originalPrice * ratioRemaining;

    let targetPrice = originalPrice;
    if (targetPlanType === 'yearly') targetPrice *= 10; // example multiplier
    else if (targetPlanType === 'quarterly') targetPrice *= 2.8;

    const prorationCharge = Math.max(0, targetPrice - remainingValue);

    res.status(200).json({
      success: true,
      remainingValue: remainingValue.toFixed(2),
      targetPrice: targetPrice.toFixed(2),
      prorationCharge: prorationCharge.toFixed(2)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Process/mock an installment payment
 */
export const processInstallmentPayment = async (req, res) => {
  try {
    const { subscriptionId, installmentIndex } = req.body;
    const subscription = await Subscription.findById(subscriptionId);

    if (!subscription) return res.status(404).json({ message: "Subscription not found" });
    if (!subscription.installmentPayments[installmentIndex]) {
      return res.status(400).json({ message: "Invalid installment index" });
    }

    subscription.installmentPayments[installmentIndex].status = 'paid';
    subscription.installmentPayments[installmentIndex].paidAt = new Date();
    await subscription.save();

    res.status(200).json({
      success: true,
      message: "Installment processed successfully",
      subscription
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get EMI configurations (mock Razorpay EMI eligibility check)
 */
export const getEMIOptions = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const price = course.price || 999;

    res.status(200).json({
      success: true,
      courseId,
      originalPrice: price,
      emiOptions: [
        { months: 3, monthlyEmi: Math.round(price / 3), interestRate: 0, type: "No-Cost EMI" },
        { months: 6, monthlyEmi: Math.round(price / 6), interestRate: 0, type: "No-Cost EMI" },
        { months: 9, monthlyEmi: Math.round((price * 1.1) / 9), interestRate: 10, type: "Standard EMI" },
        { months: 12, monthlyEmi: Math.round((price * 1.12) / 12), interestRate: 12, type: "Standard EMI" }
      ]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
