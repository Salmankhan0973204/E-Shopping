import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

// ─── Token generators ───────────────────────────────────────────────────────
const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "15m", // ← short lived
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d", // ← long lived
  });
};

// ─── Register ───────────────────────────────────────────────────────────────
export const registerUser = async ({ name, email, password }) => {

  // 1. check email already exist karta hai?
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error("Email already registered");

  // 2. user create karo (password model mein auto hash hoga)
  const user = await User.create({ name, email, password });

  // 3. tokens banao
  const accessToken  = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // 4. refresh token DB mein save karo
  user.refreshToken = refreshToken;
  await user.save();

  return {
    accessToken,
    refreshToken,
    user: {
      id:    user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
    },
  };
};

// ─── Login ──────────────────────────────────────────────────────────────────
export const loginUser = async ({ email, password }) => {

  // 1. user find karo — password bhi chahiye isliye +password
  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new Error("Invalid email or password");

  // 2. password compare karo
  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new Error("Invalid email or password");

  // 3. tokens banao
  const accessToken  = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // 4. refresh token DB mein update karo
  user.refreshToken = refreshToken;
  await user.save();

  return {
    accessToken,
    refreshToken,
    user: {
      id:    user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
    },
  };
};

// ─── Refresh Token ──────────────────────────────────────────────────────────
export const refreshAccessToken = async (token) => {

  if (!token) throw new Error("Refresh token missing");

  // 1. token verify karo
  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

  // 2. user find karo DB mein — refreshToken bhi chahiye
  const user = await User.findById(decoded.id).select("+refreshToken");
  if (!user || user.refreshToken !== token) throw new Error("Invalid refresh token");

  // 3. naya access token banao
  const newAccessToken = generateAccessToken(user._id);

  return { accessToken: newAccessToken };
};

// ─── Logout ─────────────────────────────────────────────────────────────────
export const logoutUser = async (userId) => {
  // DB se refresh token hata do
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};