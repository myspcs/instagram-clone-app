const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}_${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

exports.uploadAvatar = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

exports.uploadPost = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

exports.deleteFile = async () => {};