import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const addressSchema = new mongoose.Schema({
  street:  { type: String },
  city:    { type: String },
  state:   { type: String },
  country: { type: String },
  zipCode: { type: String },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // ← password query mein automatically nahi aayega
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    addresses: [addressSchema], // ← multiple addresses store ho sakti hain

    refreshToken: {
      type: String,
      select: false, // ← secure rakho
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    resetPasswordToken:   { type: String, select: false },
    resetPasswordExpires: { type: Date,   select: false },
  },
  {
    timestamps: true, // ← createdAt & updatedAt auto add hoga
  }
);

// ─── Hash password before saving ───────────────────────────────────────────
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// ─── Instance method — password compare ────────────────────────────────────
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model("User", userSchema);