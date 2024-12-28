const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    const authToken = req.headers.authorization;
    if (authToken) {
        const token = authToken.split(' ')[1];
        try {
            const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decodedPayload;
            next();
        } catch (error) {
            res.status(401).json({ message: "Invalid token, access denied" });
        }
    } else {
        res.status(401).json({ message: "No token provided, access denied" });
    }
}

function verifyTokenAndAdmin(req, res, next) {
    verifyToken(req, res, () => {
        if (req.user.isAdmin) {
            next();
        } else {
            return res.status(403).json({ message: "User is not admin" });
        }
    });
}

function verifyTokenAndOnlyUser(req, res, next) {
    verifyToken(req, res, () => {
        if (req.user.id === req.params.id || req.user.isAdmin) {
            next();
        } else {
            return res.status(403).json({ message: "Only User Self" });
        }
    });
}

function verifyTokenAndOnlyUserAuthorization(req, res, next) {
    verifyToken(req, res, () => {
        if (req.user.id === req.params.id || req.user.isAdmin) {
            next();
        } else {
            return res.status(403).json({ message: "Only User Self or Admin" });
        }
    });
}

module.exports = { verifyToken, verifyTokenAndAdmin, verifyTokenAndOnlyUser, verifyTokenAndOnlyUserAuthorization };
