import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {body, validationResult} from 'express-validator';
import { User } from '../models/user.js';

const router = express.Router();
const registerValidation = [
    body('username').trim().isLength({min:3}).escape(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({min:6})
];

router.post("/register", registerValidation, async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) 
        return res.status(400).json({errors: errors.array()});

    const{username, email, password} = req.body;

    console.log(username, email, password)
    try{
        const existinguser = await User.findOne({email});
        if(existinguser){   
            console.log("Existing user", existinguser);
            return res.status(400).json({message: "User already exists"});
        }
        
        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({username, email, password: hashedPassword});

        console.log("User", user);

        res.status(201).json({success: true, message: "User created successfully"});
    } catch(error){
        console.error("❌ REGISTRATION DATABASE CRASH:", error); 
        res.status(500).json({message: "server error"});
    }
});

router.post("/login", async (req, res) => {
    const {email, password} = req.body;
    try{
        const user = await User.findOne({email}).select("+password");
        if(!user) return res.status(400).json({message: "Invalid credentials"});

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) return res.status(400).json({message: "Invalid credentials"});

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET,{expiresIn: "7d"});
        res.json({success:true, token, user:{username: user.username, email: user.email, credits:user.credits}});

    }catch(error){
        res.status(500).json({message: "Server error"});
    }
});

export default router;