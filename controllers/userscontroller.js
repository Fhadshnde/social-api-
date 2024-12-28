const asyncHandler = require("express-async-handler");
const { User, validateUpdateUser } = require("../models/User");
const bcrypt = require("bcryptjs");
const { uploadImage, removeImage } = require("../utils/uploadImage");

// دالة جلب جميع المستخدمين
module.exports.getAllUsersCtrl = asyncHandler(async (req, res) => {
    const users = await User.find().select("-password").populate("posts");
    res.status(200).json(users);
});

// دالة جلب مستخدم محدد بواسطة معرفه
module.exports.getUserCtrl = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select("-password").populate("posts");
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user);
});

// دالة تحديث بيانات المستخدم
module.exports.updateUserCtrl = asyncHandler(async (req, res) => {
    const { error } = validateUpdateUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, {
        $set: {
            username: req.body.username,
            bio: req.body.bio,
            password: req.body.password,
        }
    }, { new: true }).select("-password");

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(updatedUser);
});

// دالة جلب عدد المستخدمين
module.exports.getUserCountCtrl = asyncHandler(async (req, res) => {
    const count = await User.countDocuments();
    res.status(200).json({ count });
});

// دالة حذف المستخدم
module.exports.deleteUserCtrl = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return res.status(404).json({ message: "user not found" });
    }

    if(user.profilePhoto && user.profilePhoto.path) {
        removeImage(user.profilePhoto.path);
    }
    
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "your profile has been deleted" });
});

// دالة تحميل صورة الملف الشخصي
module.exports.uploadProfilePhotoCtrl = asyncHandler(async (req, res) => {
  console.log('File received:', req.file); // تحقق من استقبال الملف
  if (!req.file) {
    return res.status(400).json({ message: 'No image provided' });
  }

  const user = await User.findById(req.user.id);
  console.log('User found:', user); // تحقق من وجود المستخدم
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const result = uploadImage(req.file);
  console.log('Image upload result:', result); // تحقق من نتيجة تحميل الصورة
  user.profilePhoto = {
    url: result.url,
    path: result.path,
  };
  await user.save();
  res.status(200).json({ message: 'Profile photo updated', profilePhoto: user.profilePhoto });
});