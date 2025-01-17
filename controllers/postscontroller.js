const asyncHandler = require("express-async-handler");
const { Post, validateCreatePost, validateUpdatePost } = require("../models/Post");

/**-----------------------------------------------
 * @desc    Create New Post
 * @route   /api/posts
 * @method  POST
 * @access  private (only logged in user)
 ------------------------------------------------*/
module.exports.createPostCtrl = asyncHandler(async (req, res) => {
  // 1. التحقق من البيانات الأخرى
  const { title, description, category, user } = req.body;

  // 2. التحقق من البيانات
  const { error } = validateCreatePost(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // 3. إنشاء منشور جديد وحفظه في قاعدة البيانات
  const post = await Post.create({
    title,
    description,
    category,
    user,
    // تم حذف حقل الصورة من هنا
  });

  // 4. إرسال استجابة إلى العميل
  res.status(201).json({
    message: "Post created successfully",
    post,
  });
});

/**-----------------------------------------------
 * @desc    Get All Posts
 * @route   /api/posts
 * @method  GET
 * @access  public
 ------------------------------------------------*/
module.exports.getAllPostsCtrl = asyncHandler(async (req, res) => {
  const POST_PER_PAGE = 3;
  const { pageNumber, category } = req.query;
  let posts;

  try {
    if (pageNumber) {
      posts = await Post.find()
        .skip((pageNumber - 1) * POST_PER_PAGE)
        .limit(POST_PER_PAGE)
        .sort({ createdAt: -1 })
        .populate("user", ["-password"]);
    } else if (category) {
      posts = await Post.find({ category })
        .sort({ createdAt: -1 })
        .populate("user", ["-password"]);
    } else {
      posts = await Post.find()
        .sort({ createdAt: -1 })
        .populate("user", ["-password"]);
    }
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts", error: error.message });
  }
});

/**-----------------------------------------------
 * @desc    Get Single Post
 * @route   /api/posts/:id
 * @method  GET
 * @access  public
 ------------------------------------------------*/
module.exports.getSinglePostCtrl = asyncHandler(async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("user", ["-password"])
      .populate("comments");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: "Error fetching the post", error: error.message });
  }
});

/**-----------------------------------------------
 * @desc    Get Posts Count
 * @route   /api/posts/count
 * @method  GET
 * @access  public
 ------------------------------------------------*/
module.exports.getPostCountCtrl = asyncHandler(async (req, res) => {
  try {
    const count = await Post.countDocuments();
    res.status(200).json(count);
  } catch (error) {
    res.status(500).json({ message: "Error counting posts", error: error.message });
  }
});

/**-----------------------------------------------
 * @desc    Delete Post
 * @route   /api/posts/:id
 * @method  DELETE
 * @access  private (only admin or owner of the post)
 ------------------------------------------------*/
module.exports.deletePostCtrl = asyncHandler(async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (req.user.isAdmin || req.user.id === post.user.toString()) {
      await Post.findByIdAndDelete(req.params.id);

      res.status(200).json({
        message: "Post has been deleted successfully",
        postId: post._id,
      });
    } else {
      res.status(403).json({ message: "Access denied, forbidden" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting the post", error: error.message });
  }
});

/**-----------------------------------------------
 * @desc    Update Post
 * @route   /api/posts/:id
 * @method  PUT
 * @access  private (only owner of the post)
 ------------------------------------------------*/
module.exports.updatePostCtrl = asyncHandler(async (req, res) => {
  // 1. التحقق من البيانات
  const { error } = validateUpdatePost(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    // 2. الحصول على المنشور من قاعدة البيانات والتحقق إذا كان موجوداً
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // 3. التأكد من أن المنشور يخص المستخدم الحالي
    if (req.user.id !== post.user.toString()) {
      return res
        .status(403)
        .json({ message: "Access denied, you are not allowed" });
    }

    // 4. تحديث المنشور
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          title: req.body.title,
          description: req.body.description,
          category: req.body.category,
          // تم حذف حقل الصورة من هنا أيضًا
        },
      },
      { new: true }
    )
      .populate("user", ["-password"])
      .populate("comments");

    // 5. إرسال استجابة إلى العميل
    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: "Error updating the post", error: error.message });
  }
});

/**-----------------------------------------------
 * @desc    Toggle Like
 * @route   /api/posts/like/:id
 * @method  PUT
 * @access  private (only logged in user)
 ------------------------------------------------*/
module.exports.toggleLikeCtrl = asyncHandler(async (req, res) => {
  const loggedInUser = req.user.id;
  const { id: postId } = req.params;

  try {
    let post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const isPostAlreadyLiked = post.likes.find(
      (user) => user.toString() === loggedInUser
    );

    if (isPostAlreadyLiked) {
      post = await Post.findByIdAndUpdate(
        postId,
        {
          $pull: { likes: loggedInUser },
        },
        { new: true }
      );
    } else {
      post = await Post.findByIdAndUpdate(
        postId,
        {
          $push: { likes: loggedInUser },
        },
        { new: true }
      );
    }

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: "Error toggling like", error: error.message });
  }
});
