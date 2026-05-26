import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String

    },
    description: {
      type: String
    },
    role: {
      type: String,
      enum: ["educator", "student", "parent", "user"],
      required: true
    },
    // Approval status for educators - students and parents are auto-approved
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: function () {
        return this.role === "educator" ? "pending" : "approved";
      }
    },
    approvalNote: {
      type: String,
      default: ""
    },
    approvedAt: {
      type: Date
    },
    photoUrl: {
      type: String,
      default: ""
    },
    enrolledCourses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    }],
    firebaseUid: {
      type: String,
      unique: true,
      sparse: true // Allows null values to coexist for existing users
    },
    supabaseId: {
      type: String,
      sparse: true
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    verificationToken: {
      type: String
    },
    verificationTokenExpires: {
      type: Date
    },
    
    // Parent-Student relationship schemas
    students: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    parents: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    linkingCode: {
      type: String,
      unique: true,
      sparse: true
    },
    age: {
      type: Number,
      default: 18
    },
    parentAccessControls: {
      showGrades: { type: Boolean, default: true },
      showAttendance: { type: Boolean, default: true },
      showAnalytics: { type: Boolean, default: true },
      showAssignments: { type: Boolean, default: true }
    },
    pendingParentLinks: [{
      parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      parentName: String,
      parentEmail: String,
      requestDate: { type: Date, default: Date.now }
    }]

  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  if (this.role === "student" && !this.linkingCode) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "JAGT-STU-";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.linkingCode = code;
  }
  next();
});

const User = mongoose.model("User", userSchema);
export default User;
