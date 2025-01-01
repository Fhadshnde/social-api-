const mongoose = require("mongoose");
const Joi = require("joi");

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    image: { // إضافة حقل الصورة
      url: {
        type: String,
        required: true,
      },
      publicId: {
        type: String,
        required: true,
      },
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

PostSchema.virtual("comments", {
  ref: "Comment",
  foreignField: "postId",
  localField: "_id",
});

const Post = mongoose.model("Post", PostSchema);

function validateCreatePost(obj) {
  const schema = Joi.object({
    title: Joi.string().trim().min(2).max(200).required(),
    description: Joi.string().trim().min(10).required(),
    category: Joi.string().trim().required(),
    user: Joi.string().required(), // أضف هذا الحقل
    image: Joi.object({ // تحقق من صحة الصورة
      url: Joi.string().uri().required(),
      publicId: Joi.string().required(),
    }).required(),
  });
  return schema.validate(obj);
}

function validateUpdatePost(obj) {
  const schema = Joi.object({
    title: Joi.string().trim().min(2).max(200),
    description: Joi.string().trim().min(10),
    category: Joi.string().trim(),
    image: Joi.object({
      url: Joi.string().uri(),
      publicId: Joi.string(),
    }),
  });
  return schema.validate(obj);
}

module.exports = {
  Post,
  validateCreatePost,
  validateUpdatePost,
};