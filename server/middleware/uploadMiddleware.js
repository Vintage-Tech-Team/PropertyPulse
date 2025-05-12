const multer = require('multer');

// Configure multer storage (temporary storage before S3 upload)
const storage = multer.memoryStorage(); // Files stored in memory buffer
const upload = multer({ storage });

module.exports = upload;
