import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
} from "../services/auth.service.js";
import { sendSuccess } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// Helper function to set Refresh Token Cookie
const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, // ← Javascript isse access nahi kar sakti (safe from XSS)
    secure: process.env.NODE_ENV === "production", // ← Production mein secure (HTTPS) chalega
    sameSite: "lax", // ← CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // ← 7 din ki expiry
  });
};

// ─── Register ───────────────────────────────────────────────────────────────
export const register = asyncHandler(async (req, res) => {
  const result = await registerUser(req.body);

  // Cookie set karo
  setRefreshTokenCookie(res, result.refreshToken);

  // Send response (bina refresh token ke)
  sendSuccess(res, 201, "User registered successfully", {
    accessToken: result.accessToken,
    user: result.user,
  });
});

// ─── Login ──────────────────────────────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
  const result = await loginUser(req.body);

  // Cookie set karo
  setRefreshTokenCookie(res, result.refreshToken);

  sendSuccess(res, 200, "Login successful", {
    accessToken: result.accessToken,
    user: result.user,
  });
});

// ─── Refresh Token ──────────────────────────────────────────────────────────
export const refresh = asyncHandler(async (req, res) => {
  // Body ke bajaye cookie se refresh token nikalo
  const refreshToken = req.cookies.refreshToken;

  const result = await refreshAccessToken(refreshToken);
  sendSuccess(res, 200, "Token refreshed", result);
});

// ─── Logout ─────────────────────────────────────────────────────────────────
export const logout = asyncHandler(async (userId, res) => {
  await logoutUser(userId);

  // Cookie ko clear karo
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  sendSuccess(res, 200, "Logged out successfully");
});