import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import ApiError from "../utils/apiError.js";
import { sendVerificationEmail } from "../utils/email.js";
import crypto from "crypto"; // ← upar add karo

// ─── Token generators ───────────────────────────────────────────────────────
const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

// ─── Register ───────────────────────────────────────────────────────────────
export const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new ApiError(409, "Email already registered");
  const verificationToken = crypto.randomBytes(32).toString("hex");

  const user = await User.create({ name, email, password, verificationToken });

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save();
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
  await sendVerificationEmail(email, name, verifyUrl);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

// ─── Login ──────────────────────────────────────────────────────────────────
export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new ApiError(401, "Invalid email or password");

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new ApiError(401, "Invalid email or password");

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save();

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

// ─── Refresh Token ──────────────────────────────────────────────────────────
export const refreshAccessToken = async (token) => {
  if (!token) throw new ApiError(401, "Refresh token missing");

  // 1. token verify karo
  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

  // 2. user find karo DB mein — refreshToken bhi chahiye
  const user = await User.findById(decoded.id).select("+refreshToken");
  if (!user || user.refreshToken !== token)
    throw new ApiError(403, "Invalid refresh token");

  // 3. naya access token banao
  const newAccessToken = generateAccessToken(user._id);

  return { accessToken: newAccessToken };
};

// ─── Logout ─────────────────────────────────────────────────────────────────
export const logoutUser = async (userId) => {
  // DB se refresh token hata do
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};


export const verifyEmail = async (token) => {
  const user = await User.findOne({ verificationToken: token }).select("+verificationToken");
  if (!user) throw new ApiError(400, "Invalid token");

  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save();

  return { message: "Email verified successfully" };
};