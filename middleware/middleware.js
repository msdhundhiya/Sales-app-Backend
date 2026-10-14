const jwt = require('jsonwebtoken');
function middleware (secretKey){
    // console.log(0);
    return function(req,res,next){

        let token = req.headers.token || req.headers.authorization;

        if (!token) {
            return res.status(401).json({
                message: "No token provided. Please sign in."
            });
        }

        if (typeof token === 'string' && token.startsWith('Bearer ')) {
            token = token.slice(7).trim();
        }

        try {
            const decoded = jwt.verify(token, secretKey);
            req.user = decoded; 
            next();
        } catch (error) {
            return res.status(403).json({
                message: "Invalid or expired token. You are not signed in.",
                error: error.message
            });
        }
    }
}

module.exports= {
    middleware
}