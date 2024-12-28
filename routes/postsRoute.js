const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { createPostCtrl, deletePostCtrl, getAllPostsCtrl, getPostCountCtrl, getSinglePostCtrl, toggleLikeCtrl, updatePostCtrl } = require('../controllers/postscontroller');
const { verifyToken, verifyTokenAndOnlyUserAuthorization } = require('../middlewares/verifyToken');
const validateObjectId = require('../middlewares/validateObjectId');

// إعداد `multer` لتحديد مكان حفظ الملفات
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../uploads'); 
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

router.post('/', verifyToken, upload.single('image'), createPostCtrl);
router.get('/count', getPostCountCtrl);
router.get('/', verifyToken, getAllPostsCtrl);
router.get('/:id', validateObjectId, getSinglePostCtrl);
router.delete('/:id', validateObjectId, verifyTokenAndOnlyUserAuthorization, deletePostCtrl);
router.put('/:id', validateObjectId, verifyTokenAndOnlyUserAuthorization, updatePostCtrl);
router.route('/like/:id').put(validateObjectId, verifyToken, toggleLikeCtrl);

module.exports = router;
