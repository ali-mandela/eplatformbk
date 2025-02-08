const jwt = require('jsonwebtoken');

module.exports.generateToken = (id) => {
    const token = jwt.sign({ id: id }, process.env.JWT_SECRET, { expiresIn: '24h' }); // Add expiration
    return token;
};

module.exports.errorHandler = (statusCode, message) => {
    const error = new Error();
    error.statusCode = statusCode;
    error.message = message;
    return error;
};

module.exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization; 

    if (!authHeader || !authHeader.startsWith('Bearer')) {
        return next(module.exports.errorHandler(401, 'Unauthorized'));
    }

    const token = authHeader.split(' ')[1]; 

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) { 
            return next(module.exports.errorHandler(403, 'Forbidden'));
        } 
        req.user = user; 
        next();
    });
};