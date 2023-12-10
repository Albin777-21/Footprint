const multer = require('multer');
const path = require('path');
const mimetype=require('mime-types')

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'public/admin/assets/imgs/category');
    },
    filename: function (req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    },
});

const fileFilter = function (req, file, callback) {
    // Check if the MIME type starts with "image/"
    if (file.mimetype.startsWith('image/')) {
        callback(null, true);
    } else {
        // Reject non-image files
        callback(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = { upload };

