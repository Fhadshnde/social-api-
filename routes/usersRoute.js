const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { 
  getAllUsersCtrl, 
  getUserCtrl, 
  updateUserCtrl, 
  getUserCountCtrl, 
  deleteUserCtrl, 
  uploadProfilePhotoCtrl // تأكد من استيراد جميع الدوال بشكل صحيح
} = require('../controllers/userscontroller');
const { 
  verifyTokenAndAdmin, 
  verifyTokenAndOnlyUser, 
  verifyToken, 
  verifyTokenAndOnlyUserAuthorization 
} = require('../middlewares/verifyToken');
const validateObjectId = require('../middlewares/validateObjectId');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

router.post('/profile/profile-photo-upload', verifyToken, upload.single('image'), uploadProfilePhotoCtrl);
router.get('/profile', verifyTokenAndAdmin, getAllUsersCtrl);
router.get('/profile/:id', validateObjectId, getUserCtrl);
router.put('/profile/:id', validateObjectId, verifyTokenAndOnlyUser, updateUserCtrl);
router.get('/count', verifyTokenAndAdmin, getUserCountCtrl);
router.delete('/profile/:id', validateObjectId, verifyTokenAndOnlyUserAuthorization, deleteUserCtrl);

module.exports = router;
