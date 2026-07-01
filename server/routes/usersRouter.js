const express = require('express');
const User = require('../models/User');
const { HTTP_STATUS } = require('../utils/constants');
const jwt = require('jsonwebtoken');
const multer = require('multer'); // 1. Import multer
const upload = multer();
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// @route POST /v1/users/
// Access Admin (We will add auth middleware later)
// @desc Create a new user (Staff or Customer)

router.post('/', upload.none(),async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // 1. Basic validation
        if (!name || !email || !password) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: "Please provide name, email, and password."
            });
        }

        // 2. Create the user
        const newUser = await User.create({
            name,
            email,
            password,
            role: role || 'customer' // Defaults to customer if no role is provided
        });

        // 3. Remove password from the response data for security
        newUser.password = undefined;

        res.status(HTTP_STATUS.CREATE_SUCCESS).json({
            success: true,
            message: `${newUser.role} created successfully!`,
            data: newUser
        });

    } catch (error) {
        console.error("Create User Error:", error);
        
        // Handle duplicate email error
        if (error.code === 11000) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        res.status(HTTP_STATUS.SERVER_ERROR).json({
            success: false,
            message: "Server Error: Could not create user",
            error: error.message
        });
    }
});

// @route POST /v1/users/login
// Access Public
// @desc Authenticate a user and return a token
router.post('/login', upload.none(), async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validate that the user actually sent both fields
        if (!email || !password) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: "Please provide an email and password"
            });
        }

        // 2. Check if the user exists in the database
        // We use `.select('+password')` because we told the User model to hide the password by default!
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // 3. Check if the password matches using the custom method we wrote in Step 1
        const isMatch = await user.matchPassword(password);
        
        if (!isMatch) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // 4. If everything is correct, generate the JWT!
        // The "payload" is the data we pack inside the token
        const payload = {
            id: user._id,
            role: user.role
        };

        // Sign the token using your secret key from the .env file
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '30d' // Token will expire in 30 days
        });

        // 5. Send the token back to the user
        res.status(HTTP_STATUS.GET_SUCCESS).json({
            success: true,
            message: "Login successful!",
            token: token, // <-- The frontend will save this token!
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(HTTP_STATUS.SERVER_ERROR).json({
            success: false,
            message: "Server Error during login",
            error: error.message
        });
    }
});

module.exports = router;