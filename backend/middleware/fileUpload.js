const fileUpload = require('express-fileupload');

const uploadMiddleware = fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    abortOnLimit: true,
    safeFileNames: true,
    preserveExtension: true
});

module.exports = uploadMiddleware;
