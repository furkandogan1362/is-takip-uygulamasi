const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer konfigürasyonu
const createStorage = (directory, prefix) => multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = directory;
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${prefix}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (allowedTypes) => (req, file, cb) => {
  const filetypes = new RegExp(allowedTypes.join('|'));
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Geçersiz dosya türü'));
  }
};

const uploadProfileCv = multer({
  storage: createStorage('uploads', 'profile-cv'),
  fileFilter: fileFilter(['pdf', 'jpeg', 'jpg', 'png'])
});

const uploadTasks = multer({
  storage: createStorage('uploads/tasks', 'task'),
  fileFilter: fileFilter(['jpeg', 'jpg', 'png'])
});

module.exports = { uploadProfileCv, uploadTasks };
