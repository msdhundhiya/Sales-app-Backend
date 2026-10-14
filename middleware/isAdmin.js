// middleware/isAdmin.js
const isAdmin = (req, res, next) => {
    try {
        // console.log('3');
        // 1. Safety check: Ensure req.user was actually set by your auth middleware
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized. No user session found." });
        }

        // 2. Check the role
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Access denied. Super Admins only." });
        }

        // 3. Move to the next route handler
        next();
    } catch (error) {
        // Catch any unexpectedcrashes and send a response so Postman doesn't hang
        res.status(500).json({ error: error.message });
    }
};

module.exports = isAdmin;
