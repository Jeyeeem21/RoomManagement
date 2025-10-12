import bcrypt from "bcrypt";
import { User, sequelize } from "../models/userModel.js";
import crypto from "crypto";
await sequelize.sync();

export const loginPage = (req, res) => {
  const now = Date.now();
  const lockoutUntil = req.session.lockoutUntil || 0;
  let lockout = false;
  let remainingTime = 0;

  // If lockout expired, clear it automatically
  if (lockoutUntil && lockoutUntil <= now) {
    req.session.loginAttempts = 0;
    req.session.lockoutUntil = null;
  } else if (lockoutUntil > now) {
    lockout = true;
    remainingTime = Math.ceil((lockoutUntil - now) / 1000);
  }

  // Retrieve flash messages
  const error = req.session.error || null;
  lockout = req.session.lockout || lockout;
  remainingTime = req.session.remainingTime || remainingTime;

  // Clear temporary messages
  req.session.error = null;
  req.session.lockout = false;
  req.session.remainingTime = 0;

  res.render("login", { 
    title: "Login", 
    error, 
    lockout, 
    remainingTime 
  });
};


export const registerPage = (req, res) => res.render("register", { title: "Register" });
export const forgotPasswordPage = (req, res) => res.render("forgotpassword", { title: "Forgot Password" });
export const dashboard = (req, res) => {
  if (!req.session.userId) return res.redirect("/login");
  res.render("dashboard", { title: "Dashboard" });
};
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const now = Date.now();
  const lockoutUntil = req.session.lockoutUntil || 0;

  // Check if locked out
 if (lockoutUntil > now) {
  const remainingTime = Math.ceil((lockoutUntil - now) / 1000);
  req.session.lockout = true;
  req.session.remainingTime = remainingTime;
  return res.redirect("/login");
}


  req.session.loginAttempts = (req.session.loginAttempts || 0) + 1;

  const user = await User.findOne({ where: { email } });

  if (!user) {
    if (req.session.loginAttempts >= 3) {
      req.session.lockoutUntil = now + 60000;
      req.session.loginAttempts = 0;
      req.session.lockout = true;
      req.session.remainingTime = 60;
    } else {
      req.session.error = `User not found. ${3 - req.session.loginAttempts} attempts remaining.`;
    }
    return res.redirect("/login");
  }

  if (user.status !== "active") {
    req.session.error = `Account is not active.`;
    return res.redirect("/login");
  }

  const hashedPassword = crypto.createHash("sha1").update(password).digest("hex");
  if (hashedPassword !== user.password) {
    if (req.session.loginAttempts >= 3) {
      req.session.lockoutUntil = now + 60000;
      req.session.loginAttempts = 0;
      req.session.lockout = true;
      req.session.remainingTime = 60;
    } else {
      req.session.error = `Incorrect password. ${3 - req.session.loginAttempts} attempts remaining.`;
    }
    return res.redirect("/login");
  }

  // Success
  req.session.loginAttempts = 0;
  req.session.lockoutUntil = null;
  req.session.userId = user.id;
  res.redirect("/dashboard");
};

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed });
  req.session.userId = user.id;
  res.redirect("/dashboard");
};

export const logoutUser = (req, res) => {
  req.session.destroy();
  res.redirect("/login");
};