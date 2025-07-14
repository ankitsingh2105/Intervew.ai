import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { signToken } from "../utils/jwt.js";
import { supabase } from "../utils/supabase.js";

// Signup (email/password) 
export async function signup(req, res) {
  try {
    const { name, email, password, college, course, yearOfGraduation} = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: "Name, email, and password are required" });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, error: "Email already registered" });
    }
    const user = await User.create({ name, email, password, college, course, yearOfGraduation, resumeUrl: null });
    const token = signToken({ id: user._id, email: user.email });
    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ success: false, error: "Signup failed" });
  }
}

// Login (email/password)
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }
    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }
    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }
    const token = signToken({ id: user._id, email: user.email });
    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ success: false, error: "Login failed" });
  }
}

// OAuth (Google) - placeholder
export async function oauth(req, res) {
  try {
    const { email, name, oauthProvider, oauthId } = req.body;
    if (!email || !oauthProvider || !oauthId) {
      return res.status(400).json({ success: false, error: "Missing OAuth fields" });
    }
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email, name, oauthProvider, oauthId });
    } else if (!user.oauthProvider || user.oauthProvider !== oauthProvider) {
      user.oauthProvider = oauthProvider;
      user.oauthId = oauthId;
      await user.save();
    }
    const token = signToken({ id: user._id, email: user.email });
    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ success: false, error: "OAuth failed" });
  }
}

// Get profile (protected)
export async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user.id).select("-password -__v");
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to get profile" });
  }
}

// Update profile (protected)
export async function updateProfile(req, res) {
  try {
    const allowed = ["name", "college", "course", "yearOfGraduation", "resumeUrl"];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, select: "-password -__v" });
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to update profile" });
  }
}
