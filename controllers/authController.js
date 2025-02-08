const { generateToken, errorHandler } = require("../config/util");
const bcryptjs = require('bcryptjs');
const userModel = require("../models/userModel");

module.exports.registerController = async(req, res) => { 
    const {
        name,
        email, 
        password, 
    } = req.body; 

    try {
        const isUser = await userModel.findOne({email});

        if (isUser) {
            return res
                .status(400)
                .json({success: false, message: 'User already exists'});
        }
        const hashedPassword = bcryptjs.hashSync(password, 10)
        const newUser = new userModel({
            name,
            email,
            password: hashedPassword, 
        });
        await newUser.save();

        const token = generateToken(newUser._id);

        return res
            .status(201)
            .json({success: true, token: token, message: 'User registered successfully'});

    } catch (error) { 
        return res
            .status(500)
            .json({success: false, message: error.message});
    }
};


module.exports.loginController = async(req, res, next) => {
    const {email, password} = req.body;

    try {
        const user = await userModel.findOne({email});

        if (!user) {
            return res
                .status(400)
                .json({success: false, message: 'Invalid email or password'});
        }

        const validPassword = bcryptjs.compareSync(password, user.password);

        if (!validPassword) 
            return next(errorHandler(401, 'Wrong credentials!'));
        
        const token = generateToken(user._id);
        return res
            .status(201)
            .json({success: true, token: token, message: 'Login successful'});

    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({success: false, message: error.message});
    }
};