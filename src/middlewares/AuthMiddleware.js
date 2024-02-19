const jwt = require('jsonwebtoken');
const {users} = require('../models');

const validateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const accessToken = authHeader && authHeader.split(' ')[1]; // Extract token from Authorization header
    if (!accessToken) {
        return res.status(401).json({error: "Access token not provided"});
    }
    try {
        const decodedToken = jwt.verify(accessToken, "hehe");
        // Check if the token is expired
        if (Date.now() >= decodedToken.exp * 1000) {
            return res.status(401).json({error: "Token expired. Please log in again."});
        }
        // Attach the decoded user information to the request object
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error("Error validating token:", error);
        return res.status(401).json({error: "Invalid token. Please log in again."});
    }
};
const validateArtist = async (req, res, next) => {
    const token = req.headers['authorization'];

    // Check if token exists and has a bearer token
    if (!token || !token.startsWith('Bearer ')) {
        return res.status(401).send('Unauthorized');
    }

    // Extract and verify token
    const cleanedToken = token.substring(7);
    const decodedToken = jwt.verify(cleanedToken, "hehe");
    const id = decodedToken.id;

    try {
        // Find user by id
        const user = await users.findOne({where: {id: id}});

        // Check if user exists and has the role of "artist"
        if (user && user.role === "artist") {
            next(); // Move to the next middleware
        } else {
            return res.status(403).json({error: "You are not authorized to perform this action"});
        }
    } catch (error) {
        console.error("Error occurred while validating artist:", error);
        return res.status(500).json({error: "Internal server error"});
    }
}


module.exports = {validateToken, validateArtist};
