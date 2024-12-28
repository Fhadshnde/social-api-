const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// تحديد مكان حفظ الملفات
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, 'uploads'); // المسار إلى مجلد uploads
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // تحديد اسم الملف
  }
});

const upload = multer({ storage: storage });

// استخدام `multer` كـ middleware لتحميل الملفات
app.use('/api/posts', require('./routes/posts'));

// بدء الخادم
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
