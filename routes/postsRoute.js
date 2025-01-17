const router = require('express').Router();
const { Post, validateCreatePost } = require('../models/Post'); // تأكد من أنك قمت بإضافة الـ Post
const { createPostCtrl, deletePostCtrl, getAllPostsCtrl, getPostCountCtrl, getSinglePostCtrl, toggleLikeCtrl, updatePostCtrl } = require('../controllers/postscontroller');
const { verifyToken, verifyTokenAndOnlyUserAuthorization } = require('../middlewares/verifyToken');
const validateObjectId = require('../middlewares/validateObjectId');

/**-----------------------------------------------
 * @desc    Create New Post
 * @route   /api/posts
 * @method  POST
 * @access  private (only logged in user)
 ------------------------------------------------*/
router.post('/', verifyToken, async (req, res) => {
  try {
    // 1. التحقق من البيانات
    const { error } = validateCreatePost(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // 2. إنشاء منشور جديد وحفظه في قاعدة البيانات (بدون صورة)
    const post = await Post.create({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      user: req.user.id,
      // تم إزالة حقل الصورة هنا
    });

    // 3. إرسال استجابة إلى العميل
    res.status(201).json({
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Failed to create post, please try again." });
  }
});

// مسار للحصول على عدد المنشورات
router.get('/count', getPostCountCtrl);

// مسار للحصول على جميع المنشورات مع تحديد العدد (التصفح باستخدام صفحة واحدة)
router.get('/', verifyToken, getAllPostsCtrl);

// مسار للحصول على منشور واحد
router.get('/:id', validateObjectId, getSinglePostCtrl);

// مسار لحذف منشور مع التحقق من الصلاحيات
router.delete('/:id', validateObjectId, verifyTokenAndOnlyUserAuthorization, deletePostCtrl);

// مسار لتحديث منشور مع التحقق من الصلاحيات
router.put('/:id', validateObjectId, verifyTokenAndOnlyUserAuthorization, updatePostCtrl);

// مسار للتفاعل مع زر الإعجاب
router.route('/like/:id').put(validateObjectId, verifyToken, toggleLikeCtrl);

module.exports = router;
