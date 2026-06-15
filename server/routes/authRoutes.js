const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

// POST /api/auth/register -> Register new student account
router.post('/register', authController.register);

// POST /api/auth/login -> Log in student and issue JWT
router.post('/login', authController.login);

// POST /api/auth/google -> Log in or register via Google OAuth
router.post('/google', authController.googleLogin);

// POST /api/auth/admin/login -> Admin-only login (no registration)
router.post('/admin/login', authController.adminLogin);

// GET /api/auth/profile -> Retrieve current user's profile and plan details (Protected)
router.get('/profile', authMiddleware, authController.getProfile);

// POST /api/auth/upgrade -> Upgrade subscription plan (Protected)
router.post('/upgrade', authMiddleware, authController.upgradePlan);

// GET /api/auth/users -> Retrieve list of all registered users (Protected, Admin Only)
router.get('/users', authMiddleware, adminOnly, authController.getAllUsers);

module.exports = router;
