const jwt = require('jsonwebtoken');
function middleware (secretKey){
    return function(req,res,next){
        const token = req.headers.token;
        if (!token) {
            return res.status(401).json({
                message: "No token provided. Please sign in."
            });
        }
        try {
            const decoded = jwt.verify(token, secretKey);
            req.userId = decoded.id; 
            next();
        } catch (error) {
            return res.status(403).json({
                message: "Invalid or expired token. You are not signed in."
            });
        }}
}

module.exports= {
    middleware
}