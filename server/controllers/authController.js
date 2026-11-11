const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

// Simple rate limiter tracker for auth endpoints in memory
const authAttempts = new Map();
function rateLimitAuth(identifier) {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 15;
  
  const record = authAttempts.get(identifier) || { count: 0, firstAttempt: now };
  if (now - record.firstAttempt > windowMs) {
    record.count = 1;
    record.firstAttempt = now;
  } else {
    record.count += 1;
  }
  authAttempts.set(identifier, record);
  return record.count <= maxAttempts;
}

function generateToken(user) {
  const secret = process.env.JWT_SECRET || 'super_secret_farmer_marketplace_jwt_key_2026_dev';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email
    },
    secret,
    { expiresIn }
  );
}

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { name, email, phone, password, role, address } = req.body;

    // Rate limit by IP/email
    const clientIp = req.ip || 'local';
    if (!rateLimitAuth(clientIp)) {
      return res.status(429).json({
        success: false,
        message: 'Too many registration attempts. Please try again after 15 minutes.'
      });
    }

    // Validation
    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, phone, password, role.'
      });
    }

    const trimmedRole = role.toLowerCase().trim();
    if (trimmedRole !== 'farmer' && trimmedRole !== 'customer') {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Direct registration only permits "farmer" or "customer".'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    if (phone.trim().length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid phone number (at least 8 digits).'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    // Check duplicate email
    const existingEmail = await UserModel.findByEmail(email.toLowerCase().trim());
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // Check duplicate phone
    const existingPhone = await UserModel.findByPhone(phone.trim());
    if (existingPhone) {
      return res.status(409).json({
        success: false,
        message: 'An account with this phone number already exists.'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userId = await UserModel.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password: hashedPassword,
      role: trimmedRole,
      address: address ? address.trim() : ''
    });

    const user = await UserModel.findById(userId);
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully!',
      token,
      user
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { identifier, email, phone, password, role } = req.body;

    const loginId = identifier || email || phone;

    if (!loginId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email or phone number along with password.'
      });
    }

    // Rate limit
    if (!rateLimitAuth(loginId)) {
      return res.status(429).json({
        success: false,
        message: 'Too many login attempts. Please try again after 15 minutes.'
      });
    }

    const user = await UserModel.findByEmailOrPhone(loginId.trim());
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.'
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact administrator.'
      });
    }

    // Optional role check if explicitly supplied
    if (role && user.role !== role.toLowerCase()) {
      return res.status(401).json({
        success: false,
        message: `Account found, but role does not match selected "${role}".`
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password. Please check your credentials.'
      });
    }

    const token = generateToken(user);
    const safeUser = await UserModel.findById(user.id);

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: safeUser
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/auth/profile
async function getProfile(req, res, next) {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/auth/profile
async function updateProfile(req, res, next) {
  try {
    const { name, phone, address } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name and phone are required to update profile.'
      });
    }

    // If phone changed, check duplicates
    if (phone !== req.user.phone) {
      const existing = await UserModel.findByPhone(phone.trim());
      if (existing && existing.id !== req.user.id) {
        return res.status(409).json({
          success: false,
          message: 'Phone number is already associated with another account.'
        });
      }
    }

    const updated = await UserModel.updateProfile(req.user.id, {
      name: name.trim(),
      phone: phone.trim(),
      address: address ? address.trim() : ''
    });

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: updated
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};

