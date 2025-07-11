const jwt = require('jsonwebtoken'); // Example using JWT

const verifyUser = (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1]; // Bearer token

    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user info to the request
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = { verifyUser };
