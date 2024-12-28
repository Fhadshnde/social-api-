const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const { User, validateRegister, validateloginUser } = require("../models/User");

const registerUserCtrl = asyncHandler(async (req, res) => {
    const { error } = validateRegister(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    
    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send('Email already registered.');
        
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);
        
    user = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashPassword
    });
        
    await user.save();
        
    res.send({ message: 'User registered successfully.' });
});

const loginUserCtrl = asyncHandler(async (req, res) => {
    const { error } = validateloginUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send('Email not registered.');

    const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isPasswordMatch) return res.status(400).send('Password not correct.');
    
    const token = user.generateAuthToken(); 
    res.status(200).json({
        _id: user._id,
        isAdmin: user.isAdmin,
        profilePhoto: user.profilePhoto,
        token: token,
        username: user.username,
    });
});

module.exports = { registerUserCtrl, loginUserCtrl };