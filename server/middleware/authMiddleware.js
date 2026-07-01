const jwt = require('jsonwebtoken');
const { HTTP_STATUS } = require('../utils/constants');

// 1. The "Protect" Middleware: Checks if the user is logged in
const protect = async (req, res, next) => {
    let token;

    // The token is usually sent in the headers as: "Bearer eyJhbGciOiJIUzI1Ni..."
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract the token (split at the space and take the second part)
            token = req.headers.authorization.split(' ')[1];

            // Verify the token using your secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach the decoded data (user id and role) to the request object
            // This allows your routes to know exactly WHO is making the request!
            req.user = decoded;

            // Move on to the next piece of middleware or the actual route
            next(); 
        } catch (error) {
            console.error("Token Verification Failed:", error);
            return res.status(401).json({ 
                success: false, 
                message: 'Not authorized, token failed or expired' 
            });
        }
    }

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Not authorized, no token provided' 
        });
    }
};

// 2. The "Authorize" Middleware: Checks if the user has the right role
const authorize = (...roles) => {
    return (req, res, next) => {
        // req.user.role was set by the 'protect' middleware above!
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false,
                message: `User role '${req.user.role}' is not authorized to access this route`
            });
        }
        next(); // User has the right role, let them through
    };
};

module.exports = { protect, authorize };