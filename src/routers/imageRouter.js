const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

//how would the path look
//localhost:8080/image/imagename

router.get('/:imageName', (req, res) => {
    try {
        // Retrieve the image name from the request parameters
        const {imageName} = req.params;

        // Construct the path to the image file
        const imagePath = path.join(__dirname, 'uploads', imageName);

        // Check if the file exists
        if (fs.existsSync(imagePath)) {
            // If the file exists, send it in the response
            res.sendFile(imagePath);
        } else {
            // If the file doesn't exist, return a 404 Not Found response
            res.status(404).json({error: 'Image not found'});
        }
    } catch (err) {
        // If an error occurs, return a 500 Internal Server Error response
        console.error('Error retrieving image:', err);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

module.exports = router;
