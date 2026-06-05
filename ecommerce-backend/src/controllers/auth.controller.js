import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
} from "../services/auth.service.js";

// Helper function to set Refresh Token Cookie
const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, // ← Javascript isse access nahi kar sakti (safe from XSS)
    secure: process.env.NODE_ENV === "production", // ← Production mein secure (HTTPS) chalega
    sameSite: "lax", // ← CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // ← 7 din ki expiry
  });
};

export const register = async (req, res, next) => {
  try {
    const result = await registerUser(req.body);

    // Cookie set karo
    setRefreshTokenCookie(res, result.refreshToken);

    // Send response (bina refresh token ke)
    res.status(201).json({
      success: true,
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res) => {
  try {
    const result = await loginUser(req.body);

    // Cookie set karo
    setRefreshTokenCookie(res, result.refreshToken);

    res.status(200).json({
      success: true,
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const refresh = async (req, res) => {
  try {
    // Body ke bajaye cookie se refresh token nikalo
    const refreshToken = req.cookies.refreshToken;
    
    const result = await refreshAccessToken(refreshToken);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    await logoutUser(req.user.id);
    
    // Cookie ko clear karo
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};