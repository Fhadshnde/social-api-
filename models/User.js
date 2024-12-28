const mongoose = require('mongoose');
const joi = require('joi');
const jwt = require("jsonwebtoken");

const UserSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 100,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 100,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 8,
    },
    profilePhoto: {
        type: Object,
        default: {
            url: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
            publicId: null,
        },
    },
    bio: {
        type: String,
        // maxlength: 2000
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    isAccountVerified: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
UserSchema.virtual("posts", {
    ref: "Post",
    foreignField: "user",
    localField: "_id",
});


UserSchema.methods.generateAuthToken = function () {
    return jwt.sign({ id: this._id, isAdmin: this.isAdmin }, process.env.JWT_SECRET);
};

const User = mongoose.model('User', UserSchema);

function validateRegister(obj) {
    const schema = joi.object({
        username: joi.string().trim().min(3).max(100).required(),
        email: joi.string().min(5).max(100).email().required(),
        password: joi.string().min(8).required(),
    });
    return schema.validate(obj);
}

function validateloginUser(obj) {
    const schema = joi.object({
        email: joi.string().min(5).max(100).email().required(),
        password: joi.string().min(8).required(),
    });
    return schema.validate(obj);
}

function validateUpdateUser(obj) { 
    const schema = joi.object({
        username: joi.string().trim().min(2).max(100),
        password: joi.string().min(8),
        bio: joi.string().max(2000),
        profilePhoto: joi.object(),
    });
    return schema.validate(obj);
}

module.exports = {
    User,
    validateRegister,
    validateloginUser,
    validateUpdateUser, 
};
